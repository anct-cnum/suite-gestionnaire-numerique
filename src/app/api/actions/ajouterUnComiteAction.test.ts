import * as nextCache from 'next/cache'

import { ajouterUnComiteAction } from './ajouterUnComiteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AjouterUnComite } from '@/use-cases/commands/AjouterUnComite'

describe('ajouter un comité action', () => {
  it('quand un comité est ajouté avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(AjouterUnComite.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await ajouterUnComiteAction({
      commentaire: 'commentaire',
      date: '2024-01-01',
      frequence: 'Mensuelle',
      path: '/gouvernance/11',
      type: 'Stratégique',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(AjouterUnComite.prototype.handle).toHaveBeenCalledWith({
      commentaire: 'commentaire',
      date: '2024-01-01',
      frequence: 'Mensuelle',
      type: 'Stratégique',
      uidEditeur: 'userFooId',
      uidGouvernance: 'gouvernanceFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand un comité est ajouté avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await ajouterUnComiteAction({
      frequence: 'Mensuelle',
      path: '',
      type: 'Stratégique',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
