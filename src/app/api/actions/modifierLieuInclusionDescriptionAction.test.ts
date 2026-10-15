import { describe, expect, it } from 'vitest'

import { modifierLieuInclusionDescriptionAction } from './modifierLieuInclusionDescriptionAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'

describe('modifier la description d’un lieu d’inclusion action', () => {
  it.each([
    {
      intention: 'un résumé trop long',
      message: 'Le résumé doit faire au plus 280 caractères',
      saisie: { presentationResume: 'a'.repeat(281) },
    },
    {
      intention: 'une présentation détaillée trop longue',
      message: 'La présentation détaillée doit faire au plus 10000 caractères',
      saisie: { presentationDetail: 'a'.repeat(10001) },
    },
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
      saisie: { websiteUrl: 'exemple.fr' },
    },
    {
      intention: 'une typologie inconnue du standard',
      message: 'Typologie inconnue du schéma national : MEDIATHEQUE',
      saisie: { typologie: 'MEDIATHEQUE' },
    },
  ])('refuse $intention, sans consulter la session (#2103)', async ({ message, saisie }) => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await modifierLieuInclusionDescriptionAction({ path: '/lieu/42', structureId: '42', ...saisie })

    // THEN
    expect(messages).toStrictEqual([message])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })
})
