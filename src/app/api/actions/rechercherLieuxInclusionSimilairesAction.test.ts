import { describe, expect, it } from 'vitest'

import { rechercherLieuxInclusionSimilairesAction } from './rechercherLieuxInclusionSimilairesAction'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { RechercherLieuxInclusionSimilaires } from '@/use-cases/queries/RechercherLieuxInclusionSimilaires'

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
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
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

  it('ne renvoie rien à un utilisateur qui ne peut pas créer de lieu', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' })
    )
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle')

    // WHEN
    const lieux = await rechercherLieuxInclusionSimilairesAction({ adresse: '1 rue de la Paix 75001 Paris' })

    // THEN
    expect(lieux).toStrictEqual([])
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).not.toHaveBeenCalled()
  })
})
