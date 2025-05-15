import * as nextCache from 'next/cache'

import { modifierUneActionAction } from './modifierUneActionAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'

describe('modifier une action action', () => {
  it('quand une action est modifiée, alors cela renvoie un succès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

    // WHEN
    const messages = await modifierUneActionAction({
      anneeDeDebut: '2026',
      budgetGlobal: 1000,
      coFinancements: [],
      contexte: '',
      description: '',
      destinataires: ['userFooId'],
      nom: 'Structurer une filière de reconditionnement locale 1',
      porteur: 'userFooId',
      temporalite: 'annuelle',
      uid: 'uidFoo',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
  })
})
