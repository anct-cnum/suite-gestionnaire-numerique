import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { modifierAdresseStructureAction } from './modifierAdresseStructureAction'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ModifierAdresseStructure } from '@/use-cases/commands/ModifierAdresseStructure'

describe('modifier l’adresse d’une structure action', () => {
  it('modifie l’adresse et purge le cache quand un bêta-testeur confirme', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ isBetaTesteur: true, role: 'Administrateur dispositif' })
    )
    vi.spyOn(ModifierAdresseStructure.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await modifierAdresseStructureAction({
      adresse: '14 rue Louis Talamoni, Champigny',
      path: '/structure/978',
      structureId: 978,
    })

    // THEN
    expect(ModifierAdresseStructure.prototype.handle).toHaveBeenCalledWith({
      adresse: '14 rue Louis Talamoni, Champigny',
      structureId: 978,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/structure/978')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie une erreur de validation quand l’adresse est vide', async () => {
    // WHEN
    const messages = await modifierAdresseStructureAction({ adresse: '', path: '/structure/978', structureId: 978 })

    // THEN
    expect(messages).toStrictEqual(['L’adresse doit être renseignée'])
  })

  it('traduit l’échec « adresse introuvable » renvoyé par la commande', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ isBetaTesteur: true, role: 'Administrateur dispositif' })
    )
    vi.spyOn(ModifierAdresseStructure.prototype, 'handle').mockResolvedValueOnce('adresseIntrouvable')

    // WHEN
    const messages = await modifierAdresseStructureAction({
      adresse: 'azertyuiop',
      path: '/structure/978',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Adresse introuvable — vérifiez la saisie'])
  })

  it('traduit le refus de modifier une structure canonique', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ isBetaTesteur: true, role: 'Administrateur dispositif' })
    )
    vi.spyOn(ModifierAdresseStructure.prototype, 'handle').mockResolvedValueOnce('structureCanoniqueNonModifiable')

    // WHEN
    const messages = await modifierAdresseStructureAction({
      adresse: '14 rue Louis Talamoni',
      path: '/structure/978',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual([
      'Cette structure utilise le nom officiel (SIRENE) et ne peut pas être modifiée',
    ])
  })

  it('refuse l’action à un utilisateur non bêta-testeur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ isBetaTesteur: false, role: 'Administrateur dispositif' })
    )

    // WHEN
    const messages = await modifierAdresseStructureAction({
      adresse: '14 rue Louis Talamoni',
      path: '/structure/978',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux administrateurs autorisés'])
  })
})
