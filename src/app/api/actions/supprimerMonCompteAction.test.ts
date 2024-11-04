import { supprimerMonCompteAction } from './supprimerMonCompteAction'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'
import { ssoProfileFactory } from '@/gateways/testHelper'
import { SupprimerMonCompte } from '@/use-cases/commands/SupprimerMonCompte'

describe('supprimer mon compte action', () => {
  it('quand mon compte est supprimé alors cela modifie mon compte', async () => {
    // GIVEN
    const sub = 'fooId'
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(ssoProfileFactory({ sub }))
    vi.spyOn(SupprimerMonCompte.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    await supprimerMonCompteAction()

    // THEN
    expect(SupprimerMonCompte.prototype.execute).toHaveBeenCalledWith({ utilisateurUid: sub })
  })
})
