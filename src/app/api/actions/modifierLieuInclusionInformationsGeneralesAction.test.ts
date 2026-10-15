import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { modifierLieuInclusionInformationsGeneralesAction } from './modifierLieuInclusionInformationsGeneralesAction'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ModifierLieuInclusionInformationsGenerales } from '@/use-cases/commands/ModifierLieuInclusionInformationsGenerales'
import { lieuDetailsReadModelFactory, utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('modifier les informations générales d’un lieu d’inclusion action', () => {
  it('renvoie une erreur de validation quand le SIRET est mal formé', async () => {
    // WHEN
    const messages = await modifierLieuInclusionInformationsGeneralesAction({
      ...modification,
      siret: '12AB',
    })

    // THEN
    expect(messages).toStrictEqual(['Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle'])
  })

  it.each([
    {
      intention: 'un SIRET dont la clé de contrôle est fausse',
      message: 'Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle',
      saisie: { siret: '13002603200017' },
    },
    {
      intention: 'un complément d’adresse que le standard refuse',
      message:
        'Ce complément contient un caractère que le schéma national n’accepte pas : évitez #, %, les guillemets droits (") et un tiret ou une arobase en tête',
      saisie: { complementAdresse: '#3' },
    },
    {
      intention: 'une typologie inconnue du standard',
      message: 'Typologie inconnue du schéma national : MEDIATHEQUE',
      saisie: { typologies: ['MEDIATHEQUE'] },
    },
  ])('refuse $intention, sans consulter la session (#2103)', async ({ message, saisie }) => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await modifierLieuInclusionInformationsGeneralesAction({ ...modification, ...saisie })

    // THEN
    expect(messages).toStrictEqual([message])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })

  it('refuse l’action à un gestionnaire non bêta-testeur (ouverture progressive, #1951)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        isBetaTesteur: false,
        role: {
          ...utilisateurReadModelFactory().role,
          nom: 'Gestionnaire département',
          type: 'gestionnaire_departement',
        },
      })
    )

    // WHEN
    const messages = await modifierLieuInclusionInformationsGeneralesAction(modification)

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux bêta-testeurs'])
  })

  it('modifie un lieu géré dans la Coop : le registre fait foi (#2105)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory({ estLieuCoop: true })
    )
    vi.spyOn(ModifierLieuInclusionInformationsGenerales.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await modifierLieuInclusionInformationsGeneralesAction(modification)

    // THEN
    expect(messages).toStrictEqual(['OK'])
    expect(ModifierLieuInclusionInformationsGenerales.prototype.handle).toHaveBeenCalledTimes(1)
  })

  it('exige le nom, l’adresse et une typologie, sans consulter la session', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await modifierLieuInclusionInformationsGeneralesAction({
      adresse: '',
      nom: '',
      path: '/lieu/42',
      structureId: '42',
      typologies: [],
    })

    // THEN
    expect(messages).toStrictEqual([
      'L’adresse du lieu doit être renseignée',
      'Le nom du lieu d’activité doit être renseigné',
      'Au moins une typologie doit être renseignée',
    ])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })
})

// Formulaire unique : les champs sont toujours saisis, le SIRET est optionnel.
const modification = {
  adresse: '1 rue de la Paix 75001 Paris',
  nom: 'Nouveau nom',
  path: '/lieu/42',
  structureId: '42',
  typologies: ['ASSO'],
}
