import * as nextCache from 'next/cache'

import { reinviterUnUtilisateurAction } from './reInviterUnUtilisateurAction'

describe('reinviter un utilisateur action', () => {
  it('étant donné un email valide quand la réinvitation est demandée alors elle est renvoyée', async () => {
    // GIVEN
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    const actionParams = {
      email: 'martin.tartempion@example.com',
    }

    // WHEN
    const result = await reinviterUnUtilisateurAction(actionParams)

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/mes-utilisateurs')
    expect(result).toBe('OK')
  })

  it('étant donné un email invalide quand la réinvitation est demandée alors cela renvoie un message d’erreur', async () => {
    // GIVEN
    const actionParams = {
      email: 'martin.tartempion',
    }

    // WHEN
    const result = await reinviterUnUtilisateurAction(actionParams)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('L’email doit être valide')
  })
})
