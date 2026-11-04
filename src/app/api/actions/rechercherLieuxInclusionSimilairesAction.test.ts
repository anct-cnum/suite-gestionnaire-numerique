import { describe, expect, it } from 'vitest'

import { rechercherLieuxInclusionSimilairesAction } from './rechercherLieuxInclusionSimilairesAction'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { RechercherLieuxInclusionSimilaires } from '@/use-cases/queries/RechercherLieuxInclusionSimilaires'
import { lieuDetailsReadModelFactory, utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('rechercher les lieux d’inclusion déjà déclarés à une adresse, action', () => {
  it('ne cherche rien sans adresse', async () => {
    // GIVEN
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle')

    // WHEN
    const lieux = await rechercherLieuxInclusionSimilairesAction({ adresse: '' })

    // THEN
    expect(lieux).toStrictEqual([])
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).not.toHaveBeenCalled()
  })

  it('présente chaque lieu avec sa typologie, son SIRET formaté, ses personnes rattachées et un lien vers sa fiche, pour un administrateur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle').mockResolvedValueOnce([
      {
        adresse: '7 Rue des Champs Seigneur 71600 Paray-le-Monial',
        id: '42',
        nom: 'Petr du Pays Charolais Brionnais',
        nombrePersonnesRattachees: 6,
        siret: '20006949700013',
        typologies: ['CCAS'],
      },
      {
        adresse: '7 Rue des Champs Seigneur 71600 Paray-le-Monial',
        id: '43',
        nom: 'France Services du Pays Charolais',
        nombrePersonnesRattachees: 1,
        siret: null,
        typologies: [],
      },
    ])

    // WHEN
    const lieux = await rechercherLieuxInclusionSimilairesAction({
      adresse: '7 rue des Champs Seigneur 71600 Paray-le-Monial',
    })

    // THEN
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).toHaveBeenCalledWith({
      adresse: '7 rue des Champs Seigneur 71600 Paray-le-Monial',
    })
    expect(lieux).toStrictEqual([
      {
        adresse: '7 Rue des Champs Seigneur 71600 Paray-le-Monial',
        href: '/lieu/42?dejaEnregistre=1',
        libellePersonnesRattachees: '6 personnes rattachées',
        libelleSiret: 'SIRET 200 069 497 00013',
        nom: 'Petr du Pays Charolais Brionnais',
        typologies: "Centres communaux d'action sociale",
      },
      {
        adresse: '7 Rue des Champs Seigneur 71600 Paray-le-Monial',
        href: '/lieu/43?dejaEnregistre=1',
        libellePersonnesRattachees: '1 personne rattachée',
        libelleSiret: 'Sans SIRET',
        nom: 'France Services du Pays Charolais',
        typologies: 'Non renseigné',
      },
    ])
  })

  it('en modification, transmet le lieu en cours et propose les autres lieux sans le bandeau « déjà enregistré », propre à la création', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory()
    )
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle').mockResolvedValueOnce([
      {
        adresse: '7 Rue des Champs Seigneur 71600 Paray-le-Monial',
        id: '43',
        nom: 'France Services du Pays Charolais',
        nombrePersonnesRattachees: 1,
        siret: null,
        typologies: [],
      },
    ])

    // WHEN
    const lieux = await rechercherLieuxInclusionSimilairesAction({
      adresse: '7 rue des Champs Seigneur 71600 Paray-le-Monial',
      idLieuEnModification: '42',
    })

    // THEN
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).toHaveBeenCalledWith({
      adresse: '7 rue des Champs Seigneur 71600 Paray-le-Monial',
      idLieuEnModification: '42',
    })
    expect(lieux.map((lieu) => lieu.href)).toStrictEqual(['/lieu/43'])
  })

  it('en modification, applique les droits de modification du lieu : un gestionnaire département voit les lieux déjà déclarés pour un lieu de son département', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory({ codeDepartement: '75' })
    )
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle').mockResolvedValueOnce([])

    // WHEN
    await rechercherLieuxInclusionSimilairesAction({
      adresse: '1 rue de la Paix 75001 Paris',
      idLieuEnModification: '42',
    })

    // THEN
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).toHaveBeenCalledTimes(1)
  })

  it('en modification, ne renvoie rien à un gestionnaire département pour un lieu hors de son département', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
    )
    vi.spyOn(PrismaRecupererLieuDetailsLoader.prototype, 'recuperer').mockResolvedValueOnce(
      lieuDetailsReadModelFactory({ codeDepartement: '69', codeRegion: '84' })
    )
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle')

    // WHEN
    const lieux = await rechercherLieuxInclusionSimilairesAction({
      adresse: '1 rue de la Paix 75001 Paris',
      idLieuEnModification: '42',
    })

    // THEN
    expect(lieux).toStrictEqual([])
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).not.toHaveBeenCalled()
  })

  // La détection suit la création : ouverte à tous les rôles, elle reste fermée hors du
  // périmètre bêta tant que #1716 n'est pas tranché (#2226).
  it('en création, renvoie les lieux déjà déclarés à un gestionnaire département bêta-testeur (#2226)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        departementCode: '75',
        isBetaTesteur: true,
        role: {
          ...utilisateurReadModelFactory().role,
          nom: 'Gestionnaire département',
          type: 'gestionnaire_departement',
        },
      })
    )
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle').mockResolvedValueOnce([])

    // WHEN
    const lieux = await rechercherLieuxInclusionSimilairesAction({ adresse: '1 rue de la Paix 75001 Paris' })

    // THEN
    expect(lieux).toStrictEqual([])
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).toHaveBeenCalledWith({
      adresse: '1 rue de la Paix 75001 Paris',
      idLieuEnModification: undefined,
    })
  })

  it('en création, ne renvoie rien hors du périmètre bêta (#2226)', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        departementCode: '75',
        isBetaTesteur: false,
        role: {
          ...utilisateurReadModelFactory().role,
          nom: 'Gestionnaire département',
          type: 'gestionnaire_departement',
        },
      })
    )
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle')

    // WHEN
    const lieux = await rechercherLieuxInclusionSimilairesAction({ adresse: '1 rue de la Paix 75001 Paris' })

    // THEN
    expect(lieux).toStrictEqual([])
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).not.toHaveBeenCalled()
  })
})
