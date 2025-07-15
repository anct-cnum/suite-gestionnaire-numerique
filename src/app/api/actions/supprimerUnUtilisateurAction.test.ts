import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { supprimerUnUtilisateurAction } from './supprimerUnUtilisateurAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { SupprimerUnUtilisateur } from '@/use-cases/commands/SupprimerUnUtilisateur'

describe('supprimer un utilisateur action', () => {
  it('quand la commande de suppression d’un utilisateur est passée, alors il est supprimé', async () => {
    // GIVEN
    const sub = 'fooId'
    const path = '/mes-utilisateurs'
    const uidUtilisateurASupprimer = 'barId'
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce(sub)
    vi.spyOn(nextCache, 'revalidatePath').mockReturnValueOnce()
    vi.spyOn(SupprimerUnUtilisateur.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await supprimerUnUtilisateurAction({ path, uidUtilisateurASupprimer })

    // THEN
    expect(SupprimerUnUtilisateur.prototype.handle).toHaveBeenCalledWith({
      uidUtilisateurASupprimer,
      uidUtilisateurCourant: sub,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(path)
    expect(messages).toStrictEqual(['OK'])
  })

  it('étant donné un path non renseigné, quand la suppression d’un utilisateur est passée, alors cela renvoie une erreur', async () => {
    // GIVEN
    const uidUtilisateurASupprimer = 'barId'
    const pathIncorrect = ''

    // WHEN
    const messages = await supprimerUnUtilisateurAction({ path: pathIncorrect, uidUtilisateurASupprimer })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
