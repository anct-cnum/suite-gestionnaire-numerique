import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { modifierUnComiteAction } from './modifierUnComiteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ModifierUnComite } from '@/use-cases/commands/ModifierUnComite'

describe('modifier un comité action', () => {
  it('quand un comité est modifié avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(ModifierUnComite.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await modifierUnComiteAction({
      commentaire: 'commentaire',
      date: '2024-01-01',
      frequence: 'Mensuelle',
      path: '/gouvernance/11',
      type: 'Stratégique',
      uid: '1',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(ModifierUnComite.prototype.handle).toHaveBeenCalledWith({
      commentaire: 'commentaire',
      date: '2024-01-01',
      frequence: 'Mensuelle',
      type: 'Stratégique',
      uid: '1',
      uidEditeur: 'userFooId',
      uidGouvernance: 'gouvernanceFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand un comité est modifié avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await modifierUnComiteAction({
      frequence: 'Mensuelle',
      path: '',
      type: 'Stratégique',
      uid: '1',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
