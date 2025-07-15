import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { ajouterUneNotePriveeAction } from './ajouterUneNotePriveeAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AjouterUneNotePrivee } from '@/use-cases/commands/AjouterUneNotePrivee'

describe('ajouter une note privée action', () => {
  it('quand un note privée est ajoutée, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(AjouterUneNotePrivee.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await ajouterUneNotePriveeAction({
      contenu: 'un contenu quelconque',
      path: '/gouvernance/11',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(AjouterUneNotePrivee.prototype.handle).toHaveBeenCalledWith({
      contenu: 'un contenu quelconque',
      uidEditeur: 'userFooId',
      uidGouvernance: 'gouvernanceFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand un note privée est ajoutée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await ajouterUneNotePriveeAction({
      contenu: 'un contenu quelconque',
      path: '',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
