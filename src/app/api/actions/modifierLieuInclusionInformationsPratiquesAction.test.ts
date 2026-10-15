import { describe, expect, it } from 'vitest'

import { modifierLieuInclusionInformationsPratiquesAction } from './modifierLieuInclusionInformationsPratiquesAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'

describe('modifier les informations pratiques d’un lieu d’inclusion action', () => {
  it.each([
    {
      intention: 'des horaires hors du format OpenStreetMap',
      message: 'Les horaires ne respectent pas le format du schéma national',
      saisie: { horaires: 'lundi matin' },
    },
    {
      intention: 'une URL de prise de rendez-vous sans protocole',
      message: 'Veuillez renseigner une URL valide (https://…)',
      saisie: { priseRdvUrl: 'rdv.exemple.fr' },
    },
    {
      intention: 'un site web invalide',
      message: 'Veuillez renseigner une URL valide, ou plusieurs séparées par « | »',
      saisie: { websiteUrl: 'https://a.fr|exemple.fr' },
    },
  ])('refuse $intention, sans consulter la session (#2103)', async ({ message, saisie }) => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await modifierLieuInclusionInformationsPratiquesAction({
      path: '/lieu/42',
      structureId: '42',
      ...saisie,
    })

    // THEN
    expect(messages).toStrictEqual([message])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })
})
