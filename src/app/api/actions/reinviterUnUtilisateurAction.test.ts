import * as nextCache from 'next/cache'

import { reinviterUnUtilisateurAction } from './reinviterUnUtilisateurAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ReinviterUnUtilisateur } from '@/use-cases/commands/ReinviterUnUtilisateur'

describe('reinviter un utilisateur action', () => {
  it('étant donné que l’uid utilisateur courant et l’uid utilisateur a réinviter sont valides quand la réinvitation est demandée alors elle est validée', async () => {
    // GIVEN
    const sub = 'uidUtilisateurCourant'
    const path = '/mes-utilisateurs'
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce(sub)
    vi.spyOn(ReinviterUnUtilisateur.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

    // WHEN
    const messages = await reinviterUnUtilisateurAction({
      path,
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviter',
    })

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(ReinviterUnUtilisateur.prototype.handle).toHaveBeenCalledWith({
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviter',
      uidUtilisateurCourant: 'uidUtilisateurCourant',
    })
    expect(messages).toStrictEqual(['OK'])
  })

  it('étant donné un path non renseigné quand la réinvitation est demandée alors cela renvoie un message d’erreur', async () => {
    // WHEN
    const messages = await reinviterUnUtilisateurAction({
      path: '',
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviter',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
