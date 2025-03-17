import * as nextCache from 'next/cache'

import { supprimerUneNoteDeContextualisationAction } from './supprimerUneNoteDeContextualisationAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'

describe('supprimer une note de contextualisation', () => {
  it('quand une note de contextualisation est supprimée avec tous ses champs requis, alors cela renvoie un succès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

    // WHEN
    const messages = await supprimerUneNoteDeContextualisationAction({
      path: '/gouvernance/11/feuille-de-route/116',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand une note de contextualisation est supprimée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await supprimerUneNoteDeContextualisationAction({
      path: '',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
