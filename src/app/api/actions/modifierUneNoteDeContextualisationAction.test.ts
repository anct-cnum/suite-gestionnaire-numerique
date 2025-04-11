import * as nextCache from 'next/cache'

import { modifierUneNoteDeContextualisationAction } from './modifierUneNoteDeContextualisationAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ModifierUneNoteDeContextualisation } from '@/use-cases/commands/ModifierUneNoteDeContextualisation'

describe('modifier une note de contextualisation', () => {
  it('quand une note de contextualisation est modifiée avec tous ses champs requis, alors cela renvoie un succès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(ModifierUneNoteDeContextualisation.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await modifierUneNoteDeContextualisationAction({
      contenu: '<p>note de contextualisation</p>',
      path: '/gouvernance/11/feuille-de-route/116',
      uidFeuilleDeRoute: 'uidFeuilleDeRoute',
    })

    // THEN
    expect(ModifierUneNoteDeContextualisation.prototype.handle).toHaveBeenCalledWith({
      contenu: '<p>note de contextualisation</p>',
      uidEditeur: 'userFooId',
      uidFeuilleDeRoute: 'uidFeuilleDeRoute',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11/feuille-de-route/116')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand une note de contextualisation est modifiée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await modifierUneNoteDeContextualisationAction({
      contenu: '<p>ma note de contextualisation</p>',
      path: '',
      uidFeuilleDeRoute: 'uidFeuilleDeRoute',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
