import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { reinviterUnUtilisateurAction } from './reinviterUnUtilisateurAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ReinviterUnUtilisateur } from '@/use-cases/commands/ReinviterUnUtilisateur'

describe('reinviter un utilisateur action', () => {
  it('étant donné que l’uid utilisateur courant et l’uid utilisateur a réinviter sont valides quand la réinvitation est demandée alors elle est validée', async () => {
    // GIVEN
    const sub = 1
    const path = '/mes-utilisateurs'
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(sub)
    vi.spyOn(ReinviterUnUtilisateur.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await reinviterUnUtilisateurAction({
      path,
      uidUtilisateurAReinviter: 2,
    })

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(ReinviterUnUtilisateur.prototype.handle).toHaveBeenCalledWith({
      uidUtilisateurAReinviter: 2,
      uidUtilisateurCourant: 1,
    })
    expect(messages).toStrictEqual(['OK'])
  })

  it('étant donné un path non renseigné quand la réinvitation est demandée alors cela renvoie un message d’erreur', async () => {
    // WHEN
    const messages = await reinviterUnUtilisateurAction({
      path: '',
      uidUtilisateurAReinviter: 2,
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
