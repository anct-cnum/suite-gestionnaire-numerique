import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { ajouterUneNoteDeContextualisationAction } from './ajouterUneNoteDeContextualisationAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AjouterUneNoteDeContextualisation } from '@/use-cases/commands/AjouterUneNoteDeContextualisation'

describe('ajouter une note de contextualisation', () => {
  it('quand une note de contextualisation est ajoutée avec tous ses champs requis, alors cela renvoie un succès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(AjouterUneNoteDeContextualisation.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await ajouterUneNoteDeContextualisationAction({
      contenu: '<p>note de contextualisation</p>',
      path: '/gouvernance/11/feuille-de-route/116',
      uidFeuilleDeRoute: '116',
    })

    // THEN
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11/feuille-de-route/116')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand une note de contextualisation est ajoutée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await ajouterUneNoteDeContextualisationAction({
      contenu: '<p>ma note de contextualisation</p>',
      path: '',
      uidFeuilleDeRoute: '116',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
