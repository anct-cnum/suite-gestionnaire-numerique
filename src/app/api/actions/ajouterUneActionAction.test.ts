import * as nextCache from 'next/cache'

import { ajouterUneActionAction } from './ajouterUneActionAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AjouterUneAction } from '@/use-cases/commands/AjouterUneAction'

describe('ajouter une action action', () => {
  it('quand une action est ajoutée avec tous ses champs requis, alors cela renvoie un succès', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(AjouterUneAction.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await ajouterUneActionAction({
      anneeDeDebut: '2026',
      anneeDeFin: '2027',
      besoins: ['etablir_diagnostic_territorial'],
      budgetGlobal: 1000,
      budgetPrevisionnel: [],
      contexte: 'Un contexte',
      description: '',
      destinataires: ['userFooId'],
      feuilleDeRoute: 'uidFeuilleDeRoute',
      gouvernance: 'gouvernanceFooId',
      nom: 'Structurer une filière de reconditionnement locale 1',
      path: '/some/path',
      porteurs: ['userFooId'],
      temporalite: 'annuelle',
    })

    // THEN
    expect(messages).toStrictEqual(['OK'])
  })
})
