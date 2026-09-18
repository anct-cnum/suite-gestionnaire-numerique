import { describe, expect, it } from 'vitest'

import { rechercherLieuxInclusionSimilairesAction } from './rechercherLieuxInclusionSimilairesAction'
import { utilisateurFactory } from '@/domain/testHelper'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { RechercherLieuxInclusionSimilaires } from '@/use-cases/queries/RechercherLieuxInclusionSimilaires'

describe('rechercher les lieux d’inclusion similaires action', () => {
  it('ne cherche rien sans nom, sans adresse ni SIRET', async () => {
    // GIVEN
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle')

    // WHEN
    const lieux = await rechercherLieuxInclusionSimilairesAction({ nom: '' })

    // THEN
    expect(lieux).toStrictEqual([])
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).not.toHaveBeenCalled()
  })

  it('présente les lieux trouvés avec un lien vers leur fiche et un motif lisible, pour un administrateur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
      utilisateurFactory({ role: 'Administrateur dispositif' })
    )
    vi.spyOn(RechercherLieuxInclusionSimilaires.prototype, 'handle').mockResolvedValueOnce([
      {
        adresse: '1 Rue de la Paix 75001 Paris',
        estLieuCoop: true,
        id: '42',
        motif: 'adresse',
        nom: 'Médiathèque',
        siret: null,
      },
      {
        adresse: '2 Rue de la Paix 75001 Paris',
        estLieuCoop: false,
        id: '43',
        motif: 'nom',
        nom: 'Mediatheque',
        siret: null,
      },
      {
        adresse: '3 Rue de la Paix 75001 Paris',
        estLieuCoop: false,
        id: '44',
        motif: 'siret',
        nom: 'Autre',
        siret: '12345678901234',
      },
    ])

    // WHEN
    const lieux = await rechercherLieuxInclusionSimilairesAction({
      adresse: '1 rue de la Paix 75001 Paris',
      nom: 'Médiathèque',
      siret: '12345678901234',
    })

    // THEN
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).toHaveBeenCalledWith({
      adresse: '1 rue de la Paix 75001 Paris',
      nom: 'Médiathèque',
      siret: '12345678901234',
    })
    expect(lieux).toStrictEqual([
      {
        adresse: '1 Rue de la Paix 75001 Paris',
        estLieuCoop: true,
        href: '/lieu/42',
        libelleMotif: 'Même adresse',
        nom: 'Médiathèque',
      },
      {
        adresse: '2 Rue de la Paix 75001 Paris',
        estLieuCoop: false,
        href: '/lieu/43',
        libelleMotif: 'Nom proche, même commune',
        nom: 'Mediatheque',
      },
      {
        adresse: '3 Rue de la Paix 75001 Paris',
        estLieuCoop: false,
        href: '/lieu/44',
        libelleMotif: 'Même SIRET',
        nom: 'Autre',
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
    const lieux = await rechercherLieuxInclusionSimilairesAction({ nom: 'Médiathèque' })

    // THEN
    expect(lieux).toStrictEqual([])
    expect(RechercherLieuxInclusionSimilaires.prototype.handle).not.toHaveBeenCalled()
  })
})
