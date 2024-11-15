import * as nextCache from 'next/cache'
import { ZodIssue } from 'zod'

import { reinviterUnUtilisateurAction } from './reinviterUnUtilisateurAction'
import { ReinviterUnUtilisateur } from '@/use-cases/commands/ReinviterUnUtilisateur'

describe('reinviter un utilisateur action', () => {
  it('étant donné que l’uid utilisateur courant et l’uid utilisateur a réinviter sont valides quand la réinvitation est demandée alors elle est validée', async () => {
    // GIVEN
    vi.spyOn(ReinviterUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    const actionParams = {
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviter',
      uidUtilisateurCourant: 'uidUtilisateurCourant',
    }

    // WHEN
    const result = await reinviterUnUtilisateurAction(actionParams)

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/mes-utilisateurs')
    expect(ReinviterUnUtilisateur.prototype.execute).toHaveBeenCalledWith(actionParams)
    expect(result).toBe('OK')
  })

  it('étant donné que l’uid utilisateur a réinviter est invalide quand la réinvitation est demandée alors cela renvoie un message d’erreur', async () => {
    // GIVEN
    const actionParams = {
      uidUtilisateurAReinviter: '',
      uidUtilisateurCourant: 'uidUtilisateurCourant',
    }

    // WHEN
    const result = await reinviterUnUtilisateurAction(actionParams)

    // THEN
    expect((result[0] as ZodIssue).message).toBe('L’identifiant de l’utilisateur à réinviter doit être renseigné')
  })

  it('étant donné que l’uid utilisateur courant est invalide quand la réinvitation est demandée alors cela renvoie un message d’erreur', async () => {
    // GIVEN
    const actionParams = {
      uidUtilisateurAReinviter: 'uidUtilisateurAReinviter',
      uidUtilisateurCourant: '',
    }

    // WHEN
    const result = await reinviterUnUtilisateurAction(actionParams)

    // THEN
    expect((result[0] as ZodIssue).message).toBe('L’identifiant de l’utilisateur courant doit être renseigné')
  })
})
