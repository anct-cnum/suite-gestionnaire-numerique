import { supprimerMonCompteAction } from './supprimerMonCompteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { SupprimerUnUtilisateur } from '@/use-cases/commands/SupprimerUnUtilisateur'

describe('supprimer mon compte action', () => {
  it('quand mon compte est supprimé, alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'fooId'
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce(sub)
    vi.spyOn(SupprimerUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await supprimerMonCompteAction()

    // THEN
    expect(SupprimerUnUtilisateur.prototype.execute).toHaveBeenCalledWith({
      uidUtilisateurASupprimer: sub,
      uidUtilisateurCourant: sub,
    })
    expect(messages).toStrictEqual(['OK'])
  })
})
