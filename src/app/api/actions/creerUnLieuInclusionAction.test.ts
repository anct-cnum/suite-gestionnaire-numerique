import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { creerUnLieuInclusionAction } from './creerUnLieuInclusionAction'
import { utilisateurFactory } from '@/domain/testHelper'
import { ApiSireneLoader } from '@/gateways/apiEntreprise/ApiSireneLoader'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { CreerUnLieuInclusion } from '@/use-cases/commands/CreerUnLieuInclusion'

describe('créer un lieu d’inclusion action', () => {
  it('renvoie une erreur de validation quand le SIRET est mal formé, sans consulter la session', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const resultat = await creerUnLieuInclusionAction({ ...creation, siret: '12AB' })

    // THEN
    expect(resultat).toStrictEqual({
      messages: [
        'Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle (ou 6-7 chiffres pour un RIDET)',
      ],
      statut: 'erreur',
    })
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })

  it.each([
    {
      intention: 'un SIRET dont la clé de contrôle est fausse',
      message:
        'Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle (ou 6-7 chiffres pour un RIDET)',
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
    const resultat = await creerUnLieuInclusionAction({ ...creation, ...saisie })

    // THEN
    expect(resultat).toStrictEqual({ messages: [message], statut: 'erreur' })
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })

  it('exige le nom, l’adresse et une typologie, sans consulter la session', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const resultat = await creerUnLieuInclusionAction({
      adresse: '',
      nom: '',
      typologies: [],
      visiblePourCartographie: false,
    })

    // THEN
    expect(resultat).toStrictEqual({
      messages: [
        'L’adresse du lieu doit être renseignée',
        'Le nom du lieu d’activité doit être renseigné',
        'Au moins une typologie doit être renseignée',
      ],
      statut: 'erreur',
    })
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })

  it('refuse un gestionnaire : la création est réservée aux administrateurs (#1495)', async () => {
    // GIVEN
    connecte('Gestionnaire département')
    vi.spyOn(CreerUnLieuInclusion.prototype, 'handle')

    // WHEN
    const resultat = await creerUnLieuInclusionAction(creation)

    // THEN
    expect(resultat).toStrictEqual({ messages: ["Vous n'avez pas les droits pour créer un lieu"], statut: 'erreur' })
    expect(CreerUnLieuInclusion.prototype.handle).not.toHaveBeenCalled()
  })

  it('avec un SIRET introuvable, renvoie le message de l’API Entreprise', async () => {
    // GIVEN
    connecte('Administrateur dispositif')
    vi.spyOn(ApiSireneLoader.prototype, 'rechercherParIdentifiant').mockResolvedValueOnce({ estTrouvee: false })

    // WHEN
    const resultat = await creerUnLieuInclusionAction({ ...creation, siret: '13002603200016' })

    // THEN
    expect(resultat).toStrictEqual({ messages: ['Aucune entreprise trouvée avec cet identifiant'], statut: 'erreur' })
  })

  it('avec un SIRET, revérifie l’identifiant côté serveur et transmet l’adresse SIRENE comme repli', async () => {
    // GIVEN
    connecte('Administrateur dispositif')
    vi.spyOn(ApiSireneLoader.prototype, 'rechercherParIdentifiant').mockResolvedValueOnce(entrepriseTrouvee)
    vi.spyOn(CreerUnLieuInclusion.prototype, 'handle').mockResolvedValueOnce({
      lieuId: 4242,
      visibilitePourCartographieForcee: false,
    })
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    await creerUnLieuInclusionAction({ ...creation, siret: '13002603200016' })

    // THEN
    expect(CreerUnLieuInclusion.prototype.handle).toHaveBeenCalledWith({
      creation: {
        adresse: '1 rue de la Paix 75001 Paris',
        complementAdresse: 'Bât. B',
        itinerant: true,
        nom: 'Mon lieu',
        repliSirene: {
          adresse: '1 rue de la Paix 75001 Paris',
          codeInsee: '75101',
          codePostal: '75001',
          commune: 'Paris',
          nomVoie: 'rue de la Paix',
          numeroVoie: '1',
        },
        siret: '13002603200016',
        typologies: ['BIB'],
      },
      visiblePourCartographie: true,
    })
  })

  it('sans SIRET, crée le lieu tel que saisi, purge la liste et renvoie l’identifiant créé', async () => {
    // GIVEN
    connecte('Administrateur dispositif')
    vi.spyOn(ApiSireneLoader.prototype, 'rechercherParIdentifiant')
    vi.spyOn(CreerUnLieuInclusion.prototype, 'handle').mockResolvedValueOnce({
      lieuId: 4242,
      visibilitePourCartographieForcee: false,
    })
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const resultat = await creerUnLieuInclusionAction(creation)

    // THEN
    expect(ApiSireneLoader.prototype.rechercherParIdentifiant).not.toHaveBeenCalled()
    expect(CreerUnLieuInclusion.prototype.handle).toHaveBeenCalledWith({
      creation: {
        adresse: '1 rue de la Paix 75001 Paris',
        complementAdresse: 'Bât. B',
        itinerant: true,
        nom: 'Mon lieu',
        repliSirene: null,
        siret: null,
        typologies: ['BIB'],
      },
      visiblePourCartographie: true,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/liste-lieux-inclusion')
    expect(resultat).toStrictEqual({
      lieuId: '4242',
      statut: 'cree',
      visibilitePourCartographieForcee: false,
    })
  })

  it('remonte l’information quand le use case a forcé la visibilité cartographie à false', async () => {
    // GIVEN
    connecte('Administrateur dispositif')
    vi.spyOn(CreerUnLieuInclusion.prototype, 'handle').mockResolvedValueOnce({
      lieuId: 4242,
      visibilitePourCartographieForcee: true,
    })
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const resultat = await creerUnLieuInclusionAction(creation)

    // THEN
    expect(resultat).toStrictEqual({
      lieuId: '4242',
      statut: 'cree',
      visibilitePourCartographieForcee: true,
    })
  })

  it('traduit l’échec du use case en message lisible', async () => {
    // GIVEN
    connecte('Administrateur dispositif')
    vi.spyOn(CreerUnLieuInclusion.prototype, 'handle').mockResolvedValueOnce('adresseIntrouvable')

    // WHEN
    const resultat = await creerUnLieuInclusionAction(creation)

    // THEN
    expect(resultat).toStrictEqual({ messages: ['Adresse introuvable — vérifiez la saisie'], statut: 'erreur' })
  })
})

// Formulaire unique : les champs sont toujours saisis, le SIRET est optionnel.
const creation = {
  adresse: '1 rue de la Paix 75001 Paris',
  complementAdresse: 'Bât. B',
  itinerant: true,
  nom: 'Mon lieu',
  typologies: ['BIB'],
  visiblePourCartographie: true,
}

const entrepriseTrouvee = {
  activitePrincipale: '94.99Z',
  adresse: '1 rue de la Paix 75001 Paris',
  categorieJuridiqueCode: '9220',
  codeInsee: '75101',
  codePostal: '75001',
  commune: 'Paris',
  denomination: 'Ma Structure',
  identifiant: '13002603200016',
  nomVoie: 'rue de la Paix',
  numeroVoie: '1',
}

function connecte(role: 'Administrateur dispositif' | 'Gestionnaire département'): void {
  vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
  vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
    utilisateurFactory({ codeOrganisation: '75', role })
  )
}
