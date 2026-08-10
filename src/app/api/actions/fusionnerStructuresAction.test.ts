import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { fusionnerStructuresAction } from './fusionnerStructuresAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { FusionnerStructures } from '@/use-cases/commands/FusionnerStructures'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('fusionner des structures action', () => {
  it('fusionne et purge le cache quand un bêta-testeur confirme', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(FusionnerStructures.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await fusionnerStructuresAction({
      idsAbsorbees: [7],
      idSurvivante: 3,
      path: '/structures-doublons/comparer?ids=3,7',
    })

    // THEN
    expect(FusionnerStructures.prototype.handle).toHaveBeenCalledWith({
      idAbsorbee: 7,
      idSurvivante: 3,
      uidUtilisateur: 1,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/structures-doublons/comparer?ids=3,7')
    expect(messages).toStrictEqual(['OK'])
  })

  it('refuse la fusion à un administrateur non bêta-testeur, même si la comparaison lui est visible', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false })
    )
    const handle = vi.spyOn(FusionnerStructures.prototype, 'handle')

    // WHEN
    const messages = await fusionnerStructuresAction({
      idsAbsorbees: [7],
      idSurvivante: 3,
      path: '/structures-doublons/comparer?ids=3,7',
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux administrateurs autorisés'])
    expect(handle).not.toHaveBeenCalled()
  })

  it('renvoie une erreur de validation quand aucune structure à absorber n’est fournie', async () => {
    // WHEN
    const messages = await fusionnerStructuresAction({
      idsAbsorbees: [],
      idSurvivante: 3,
      path: '/structures-doublons/comparer?ids=3,7',
    })

    // THEN
    expect(messages).toStrictEqual(['Sélectionnez au moins une structure à fusionner'])
  })
})
