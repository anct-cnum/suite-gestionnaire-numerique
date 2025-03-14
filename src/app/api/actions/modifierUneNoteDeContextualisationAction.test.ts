import * as nextCache from 'next/cache'

import { modifierUneNoteDeContextualisationAction } from './modifierUneNoteDeContextualisationAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'

describe('modifier une note de contextualisation', () => {
  it('quand une note de contextuelisation est modifiée avec tous ses champs requis, alors cela renvoie un succès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

    // WHEN
    const messages = await modifierUneNoteDeContextualisationAction({
      contenu: '<p>note de contextualisation</p>',
      path: '/gouvernance/11/feuille-de-route/116',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand une note de contextuelisation est modifiée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await modifierUneNoteDeContextualisationAction({
      contenu: '<p>ma note de contextuelisation</p>',
      path: '',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
