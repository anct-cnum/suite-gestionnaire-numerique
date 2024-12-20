import { supprimerMonCompteAction } from './supprimerMonCompteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { SupprimerMonCompte } from '@/use-cases/commands/SupprimerMonCompte'

describe('supprimer mon compte action', () => {
  it('quand mon compte est supprimé, alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'fooId'
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce(sub)
    vi.spyOn(SupprimerMonCompte.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await supprimerMonCompteAction()

    // THEN
    expect(SupprimerMonCompte.prototype.execute).toHaveBeenCalledWith({ uidUtilisateurCourant: sub })
    expect(messages).toStrictEqual(['OK'])
  })
})
