import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { supprimerUneActionAction } from './supprimerUneActionAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { SupprimerUneAction } from '@/use-cases/commands/SupprimerUneAction'

describe('supprimer une action action', () => {
  it('quand une action est supprimée, alors l’éditeur est issu de la session, le succès est renvoyé et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)
    vi.spyOn(SupprimerUneAction.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await supprimerUneActionAction({
      path: '/gouvernance/11/feuille-de-route/1',
      uidActionASupprimer: 'actionFooId',
    })

    // THEN
    expect(SupprimerUneAction.prototype.handle).toHaveBeenCalledWith({
      uidActionASupprimer: 'actionFooId',
      uidEditeur: 1,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11/feuille-de-route/1')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand la suppression est refusée par la commande, alors l’erreur est renvoyée telle quelle', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)
    vi.spyOn(SupprimerUneAction.prototype, 'handle').mockResolvedValueOnce('suppressionActionNonAutorisee')

    // WHEN
    const messages = await supprimerUneActionAction({
      path: '/gouvernance/11/feuille-de-route/1',
      uidActionASupprimer: 'actionFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['suppressionActionNonAutorisee'])
  })

  it('quand l’identifiant de l’action est vide, alors une erreur de validation est renvoyée sans consulter la session', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId')

    // WHEN
    const messages = await supprimerUneActionAction({
      path: '/gouvernance/11/feuille-de-route/1',
      uidActionASupprimer: '',
    })

    // THEN
    expect(messages).toStrictEqual(['L’id de l’action doit doit être renseigné'])
    expect(ssoGateway.getSessionUtilisateurId).not.toHaveBeenCalled()
  })
})
