import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { supprimerDocumentAction } from './supprimerDocumentAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { SupprimerDocument } from '@/use-cases/commands/SupprimerDocument'

describe('supprimer un document', () => {
  it('quand un document est supprimé avec tous ses champs requis, alors cela renvoie un succès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(SupprimerDocument.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await supprimerDocumentAction({
      path: '/gouvernance/11/feuille-de-route/116',
      uidFeuilleDeRoute: 'uidFeuilleDeRoute',
    })

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11/feuille-de-route/116')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand un document est supprimé avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await supprimerDocumentAction({
      path: '',
      uidFeuilleDeRoute: 'uidFeuilleDeRoute',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})