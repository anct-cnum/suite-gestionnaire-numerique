import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { modifierNomStructureAction } from './modifierNomStructureAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { ModifierNomStructure } from '@/use-cases/commands/ModifierNomStructure'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('modifier le nom d’une structure action', () => {
  it('modifie le nom et purge le cache quand un bêta-testeur confirme', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(ModifierNomStructure.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await modifierNomStructureAction({
      nomAffichage: 'Paris Est Marne et Bois',
      path: '/structure/978',
      structureId: 978,
    })

    // THEN
    expect(ModifierNomStructure.prototype.handle).toHaveBeenCalledWith({
      nomAffichage: 'Paris Est Marne et Bois',
      structureId: 978,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/structure/978')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie une erreur de validation quand le nom dépasse 255 caractères', async () => {
    // WHEN
    const messages = await modifierNomStructureAction({
      nomAffichage: 'a'.repeat(256),
      path: '/structure/978',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Le nom ne doit pas dépasser 255 caractères'])
  })

  it('traduit l’échec métier renvoyé par la commande (structure canonique)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(ModifierNomStructure.prototype, 'handle').mockResolvedValueOnce('structureCanoniqueNonRenommable')

    // WHEN
    const messages = await modifierNomStructureAction({
      nomAffichage: 'Nouveau nom',
      path: '/structure/978',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Cette structure utilise le nom officiel (SIRENE) et ne peut pas être renommée'])
  })

  it('refuse l’action à un utilisateur non bêta-testeur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findByUid').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: false })
    )

    // WHEN
    const messages = await modifierNomStructureAction({
      nomAffichage: 'Nouveau nom',
      path: '/structure/978',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux administrateurs autorisés'])
  })
})
