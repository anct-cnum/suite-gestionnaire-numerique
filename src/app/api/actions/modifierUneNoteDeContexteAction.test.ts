import * as nextCache from 'next/cache'
import { describe, it } from 'vitest'

import { modifierUneNoteDeContexteAction } from './modifierUneNoteDeContexteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ModifierUneNoteDeContexte } from '@/use-cases/commands/ModifierUneNoteDeContexte'

describe('modifier une note de contexte', () => {
  it('quand une note de contexte est modifiée avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(ModifierUneNoteDeContexte.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await modifierUneNoteDeContexteAction({
      contenu: '<p>ma note de contexte modifiée</p>',
      path: '/gouvernance/11',
      uidGouvernance: 'uidGouvernance',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(ModifierUneNoteDeContexte.prototype.execute).toHaveBeenCalledWith({
      contenu: '<p>ma note de contexte modifiée</p>',
      uidEditeur: 'userFooId',
      uidGouvernance: 'uidGouvernance',
    })
  })

  it('quand une note de contexte est mofidiée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await modifierUneNoteDeContexteAction({
      contenu: '<p>ma note de contexte modifiée</p>',
      path: '',
      uidGouvernance: 'uidGouvernance',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })

  it('quand une note de contexte modifiée contient du HTML malveillant, alors le contenu est assaini', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(ModifierUneNoteDeContexte.prototype, 'execute').mockResolvedValueOnce('OK')

    const contenuMalveillant = '<p>Contenu légitime</p><script>alert("xss")</script><img src="x" onerror="alert(1)">'

    // WHEN
    await modifierUneNoteDeContexteAction({
      contenu: contenuMalveillant,
      path: '/gouvernance/11',
      uidGouvernance: 'uidGouvernance',
    })

    // THEN
    expect(ModifierUneNoteDeContexte.prototype.execute).toHaveBeenCalledWith({
      contenu: '<p>Contenu légitime</p>',
      uidEditeur: 'userFooId',
      uidGouvernance: 'uidGouvernance',
    })
  })
})
