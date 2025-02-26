import * as nextCache from 'next/cache'

import { ajouterUneActionAction } from './ajouterUneActionAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'

describe('ajouter une action action', () => {
  it('quand une action est ajoutée avec tous ses champs requis, alors cela renvoie un succès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

    // WHEN
    const messages = await ajouterUneActionAction({
      anneeDeDebut: '2026',
      anneeDeFin: '2027',
      budgetGlobal: 1000,
      budgetPrevisionnel: [],
      contexte: '',
      description: '',
      destinataires: ['userFooId'],
      nom: 'Structurer une filière de reconditionnement locale 1',
      porteur: 'userFooId',
      temporalite: 'annuelle',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
  })
})
