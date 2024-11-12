import { supprimerUnUtilisateurAction } from './supprimerUnUtilisateurAction'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'
import { SupprimerUnUtilisateur } from '@/use-cases/commands/SupprimerUnUtilisateur'

describe('supprimer un utilisateur action', () => {
  it('quand la commande de suppression d’un utilisateur est passée, alors il est supprimé', async () => {
    // GIVEN
    const sub = 'fooId'
    const utilisateurASupprimerUid = 'barId'
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
    vi.spyOn(SupprimerUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    await supprimerUnUtilisateurAction(utilisateurASupprimerUid)

    // THEN
    expect(SupprimerUnUtilisateur.prototype.execute).toHaveBeenCalledWith({
      utilisateurASupprimerUid,
      utilisateurCourantUid: sub,
    })
  })
})
