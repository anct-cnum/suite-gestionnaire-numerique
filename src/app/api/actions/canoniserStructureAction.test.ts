import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { canoniserStructureAction } from './canoniserStructureAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { CanoniserStructure } from '@/use-cases/commands/CanoniserStructure'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('canoniser une structure action', () => {
  it('canonise et purge le cache quand un bêta-testeur confirme', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(CanoniserStructure.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await canoniserStructureAction({ path: '/structures-doublons/comparer?ids=3,4', structureId: 3 })

    // THEN
    expect(CanoniserStructure.prototype.handle).toHaveBeenCalledWith({ structureId: 3, uidUtilisateur: 'userFooId' })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/structures-doublons/comparer?ids=3,4')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie une erreur de validation quand l’identifiant est invalide', async () => {
    // WHEN
    const messages = await canoniserStructureAction({ path: '/structures-doublons', structureId: 0 })

    // THEN
    expect(messages).toStrictEqual(["L'identifiant de la structure doit être un entier positif"])
  })

  it('traduit le refus de canoniser quand une canonique de même SIRET existe', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(CanoniserStructure.prototype, 'handle').mockResolvedValueOnce('canoniqueExistante')

    // WHEN
    const messages = await canoniserStructureAction({ path: '/structures-doublons', structureId: 3 })

    // THEN
    expect(messages).toStrictEqual(['Une structure canonique existe déjà pour ce SIRET : fusionnez-la plutôt'])
  })

  it('refuse l’action à un utilisateur non bêta-testeur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false })
    )

    // WHEN
    const messages = await canoniserStructureAction({ path: '/structures-doublons', structureId: 3 })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux administrateurs autorisés'])
  })
})
