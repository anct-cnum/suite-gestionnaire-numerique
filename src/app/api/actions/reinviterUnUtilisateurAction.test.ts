import * as nextCache from 'next/cache'
import { ZodIssue } from 'zod'

import { reinviterUnUtilisateurAction } from './reinviterUnUtilisateurAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ReinviterUnUtilisateur } from '@/use-cases/commands/ReinviterUnUtilisateur'

describe('reinviter un utilisateur action', () => {
  it('étant donné que l’uid utilisateur courant et l’uid utilisateur a réinviter sont valides quand la réinvitation est demandée alors elle est validée', async () => {
    // GIVEN
    const sub = 'uidUtilisateurCourant'
    const path = '/mes-utilisateurs'
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
    vi.spyOn(ReinviterUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

    // WHEN
    const result = await reinviterUnUtilisateurAction({
      path,
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviter',
    })

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(ReinviterUnUtilisateur.prototype.execute).toHaveBeenCalledWith({
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviter',
      uidUtilisateurCourant: 'uidUtilisateurCourant',
    })
    expect(result).toBe('OK')
  })

  it('étant donné que l’uid utilisateur a réinviter est invalide quand la réinvitation est demandée alors cela renvoie un message d’erreur', async () => {
    // WHEN
    const result = await reinviterUnUtilisateurAction({
      path: '/',
      uidUtilisateurAReinviter: '',
    })

    // THEN
    expect((result[0] as ZodIssue).message).toBe('L’identifiant de l’utilisateur à réinviter doit être renseigné')
  })
})
