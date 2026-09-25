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
    const resultat = await creerUnLieuInclusionAction({
      siret: '12AB',
      typologies: ['ASSO'],
      visiblePourCartographie: false,
    })

    // THEN
    expect(resultat).toStrictEqual({
      messages: ['Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)'],
      statut: 'erreur',
    })
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })

  it('refuse un gestionnaire : la création est réservée aux administrateurs (#1495)', async () => {
    // GIVEN
    connecte('Gestionnaire département')
    vi.spyOn(CreerUnLieuInclusion.prototype, 'handle')

    // WHEN
    const resultat = await creerUnLieuInclusionAction(creationSansSiret)

    // THEN
    expect(resultat).toStrictEqual({ messages: ["Vous n'avez pas les droits pour créer un lieu"], statut: 'erreur' })
    expect(CreerUnLieuInclusion.prototype.handle).not.toHaveBeenCalled()
  })

  it('avec SIRET, exige au moins une typologie avant d’interroger l’API Entreprise (règle #1498)', async () => {
    // GIVEN
    connecte('Administrateur dispositif')
    vi.spyOn(ApiSireneLoader.prototype, 'rechercherParIdentifiant')

    // WHEN
    const resultat = await creerUnLieuInclusionAction({
      siret: '12345678901234',
      typologies: [],
      visiblePourCartographie: false,
    })

    // THEN
    expect(resultat).toStrictEqual({ messages: ['Au moins une typologie doit être renseignée'], statut: 'erreur' })
    expect(ApiSireneLoader.prototype.rechercherParIdentifiant).not.toHaveBeenCalled()
  })

  it('avec SIRET introuvable, renvoie le message de l’API Entreprise', async () => {
    // GIVEN
    connecte('Administrateur dispositif')
    vi.spyOn(ApiSireneLoader.prototype, 'rechercherParIdentifiant').mockResolvedValueOnce({ estTrouvee: false })

    // WHEN
    const resultat = await creerUnLieuInclusionAction({
      siret: '12345678901234',
      typologies: ['ASSO'],
      visiblePourCartographie: false,
    })

    // THEN
    expect(resultat).toStrictEqual({ messages: ['Aucune entreprise trouvée avec cet identifiant'], statut: 'erreur' })
  })

  it('sans SIRET, crée le lieu, purge la liste et renvoie l’identifiant créé', async () => {
    // GIVEN
    connecte('Administrateur dispositif')
    vi.spyOn(CreerUnLieuInclusion.prototype, 'handle').mockResolvedValueOnce({
      lieuId: 4242,
      visibilitePourCartographieForcee: false,
    })
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const resultat = await creerUnLieuInclusionAction(creationSansSiret)

    // THEN
    expect(CreerUnLieuInclusion.prototype.handle).toHaveBeenCalledWith({
      creation: {
        sansSiret: {
          adresse: '1 rue de la Paix 75001 Paris',
          complementAdresse: 'Bât. B',
          itinerant: true,
          nom: 'Mon lieu',
          typologies: ['BIB'],
        },
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
    const resultat = await creerUnLieuInclusionAction(creationSansSiret)

    // THEN
    expect(resultat).toStrictEqual({
      lieuId: '4242',
      statut: 'cree',
      visibilitePourCartographieForcee: true,
    })
  })

  it('sans SIRET, exige le nom, l’adresse et une typologie', async () => {
    // GIVEN
    connecte('Administrateur dispositif')

    // WHEN
    const resultat = await creerUnLieuInclusionAction({
      nom: 'Mon lieu',
      typologies: ['BIB'],
      visiblePourCartographie: false,
    })

    // THEN
    expect(resultat).toStrictEqual({
      messages: ['Sans SIRET, le nom, l’adresse et au moins une typologie doivent être renseignés'],
      statut: 'erreur',
    })
  })

  it('traduit l’échec du use case en message lisible', async () => {
    // GIVEN
    connecte('Administrateur dispositif')
    vi.spyOn(CreerUnLieuInclusion.prototype, 'handle').mockResolvedValueOnce('adresseIntrouvable')

    // WHEN
    const resultat = await creerUnLieuInclusionAction(creationSansSiret)

    // THEN
    expect(resultat).toStrictEqual({ messages: ['Adresse introuvable — vérifiez la saisie'], statut: 'erreur' })
  })
})

const creationSansSiret = {
  adresse: '1 rue de la Paix 75001 Paris',
  complementAdresse: 'Bât. B',
  itinerant: true,
  nom: 'Mon lieu',
  typologies: ['BIB'],
  visiblePourCartographie: true,
}

function connecte(role: 'Administrateur dispositif' | 'Gestionnaire département'): void {
  vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
  vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
    utilisateurFactory({ codeOrganisation: '75', role })
  )
}
