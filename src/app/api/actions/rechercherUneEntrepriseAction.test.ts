import { describe, expect, it } from 'vitest'

import { rechercherUneEntrepriseAction } from './rechercherUneEntrepriseAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { RechercherUneEntreprise } from '@/use-cases/queries/RechercherUneEntreprise'

describe('rechercher une entreprise action', () => {
  it('étant donné un visiteur non connecté, quand il recherche une entreprise, alors la recherche est refusée', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)
    vi.spyOn(RechercherUneEntreprise.prototype, 'handle')

    // WHEN
    const resultat = await rechercherUneEntrepriseAction({ siret: '13002603200016' })

    // THEN
    expect(resultat).toStrictEqual(['Vous devez être connecté pour rechercher une entreprise'])
    expect(RechercherUneEntreprise.prototype.handle).not.toHaveBeenCalled()
  })

  it('étant donné un utilisateur connecté, quand il recherche une entreprise, alors la recherche est effectuée', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(RechercherUneEntreprise.prototype, 'handle').mockResolvedValueOnce({ estTrouvee: false })

    // WHEN
    const resultat = await rechercherUneEntrepriseAction({ siret: '13002603200016' })

    // THEN
    expect(RechercherUneEntreprise.prototype.handle).toHaveBeenCalledWith({ siret: '13002603200016' })
    expect(resultat).toStrictEqual(['Aucune entreprise trouvée avec cet identifiant'])
  })
})
