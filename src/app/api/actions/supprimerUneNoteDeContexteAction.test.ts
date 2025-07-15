import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { supprimerUneNoteDeContexteAction } from './supprimerUneNoteDeContexteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { SupprimerUneNoteDeContexte } from '@/use-cases/commands/SupprimerUneNoteDeContexte'

describe('supprimer une note de contexte', () => {
  it('quand une note de contexte est supprimée, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(SupprimerUneNoteDeContexte.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await supprimerUneNoteDeContexteAction({
      path: '/gouvernance/11',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(SupprimerUneNoteDeContexte.prototype.handle).toHaveBeenCalledWith({
      uidEditeur: 'userFooId',
      uidGouvernance: 'gouvernanceFooId',
    })
  })

  it('quand une note de contexte est supprimée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await supprimerUneNoteDeContexteAction({
      path: '',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
