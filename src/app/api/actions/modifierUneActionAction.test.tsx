import * as nextCache from 'next/cache'

import { modifierUneActionAction } from './modifierUneActionAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ModifierUneAction } from '@/use-cases/commands/ModifierUneAction'

describe('modifier une action action', () => {
  it('quand une action est modifiée, alors cela renvoie un succès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(ModifierUneAction.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await modifierUneActionAction({
      anneeDeDebut: '2026',
      besoins: ['etablir_diagnostic_territorial'],
      budgetGlobal: 1000,
      coFinancements: [],
      contexte: 'Un contexte mis à jour',
      description: 'Une description qui est obligatoire et mise à jour',
      destinataires: ['userFooId'],
      feuilleDeRoute: 'uidFeuilleDeRoute',
      gouvernance: 'gouvernanceFooId',
      nom: 'Structurer une filière de reconditionnement locale 1',
      path: '/some/path',
      porteurs: ['userFooId'],
      uid: 'uidFoo',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
  })
})
