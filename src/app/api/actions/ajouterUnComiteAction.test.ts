import * as nextCache from 'next/cache'

import { ajouterUnComiteAction } from './ajouterUnComiteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AjouterUnComite } from '@/use-cases/commands/AjouterUnComite'

describe('ajouter un comité action', () => {
  it('quand un comité est ajouté avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(AjouterUnComite.prototype, 'execute').mockResolvedValueOnce('OK')
    const actionParams = {
      commentaire: 'commentaire',
      date: '1970-01-01',
      frequence: 'mensuelle',
      gouvernanceId: 'gouvernanceFooId',
      path: '/gouvernance/11',
      type: 'strategique',
    }

    // WHEN
    const messages = await ajouterUnComiteAction(actionParams)

    // THEN
    expect(AjouterUnComite.prototype.execute).toHaveBeenCalledWith({
      commentaire: 'commentaire',
      date: '1970-01-01',
      frequence: 'mensuelle',
      gouvernanceUid: 'gouvernanceFooId',
      type: 'strategique',
      utilisateurUid: 'userFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(messages).toStrictEqual(['OK'])
  })

  it.each([
    {
      actionParams: {
        commentaire: '',
        frequence: 'mensuelle',
        gouvernanceId: 'gouvernanceFooId',
        path: '/gouvernance/11',
        type: 'stratégique',
      },
      intention: 'quand un comité est ajouté avec un commentaire vide, alors cela renvoie une erreur',
      message: 'Le commentaire doit contenir au moins 1 caractère',
    },
    {
      actionParams: {
        date: '01-01-1970',
        frequence: 'mensuelle',
        gouvernanceId: 'gouvernanceFooId',
        path: '/gouvernance/11',
        type: 'stratégique',
      },
      intention: 'quand un comité est ajouté avec une date invalide, alors cela renvoie une erreur',
      message: 'La date est invalide',
    },
    {
      actionParams: {
        frequence: '',
        gouvernanceId: 'gouvernanceFooId',
        path: '/gouvernance/11',
        type: 'stratégique',
      },
      intention: 'quand un comité est ajouté avec une fréquance non renseignée, alors cela renvoie une erreur',
      message: 'La fréquence du comité doit être renseignée',
    },
    {
      actionParams: {
        frequence: 'mensuelle',
        gouvernanceId: '',
        path: '/gouvernance/11',
        type: 'stratégique',
      },
      intention: 'quand un comité est ajouté avec un identifiant de gouvernance non renseigné, alors cela renvoie une erreur',
      message: 'L’identifiant de la gouvernance doit être renseigné',
    },
    {
      actionParams: {
        frequence: 'mensuelle',
        gouvernanceId: 'gouvernanceFooId',
        path: '',
        type: 'stratégique',
      },
      intention: 'quand un comité est ajouté avec un chemin de page non renseigné, alors cela renvoie une erreur',
      message: 'Le chemin doit être renseigné',
    },
    {
      actionParams: {
        frequence: 'mensuelle',
        gouvernanceId: 'gouvernanceFooId',
        path: '/gouvernance/11',
        type: '',
      },
      intention: 'quand un comité est ajouté avec un type non renseigné, alors cela renvoie une erreur',
      message: 'Le type de comité doit être renseigné',
    },
  ])('$intention', async ({ actionParams, message }) => {
    // WHEN
    const messages = await ajouterUnComiteAction(actionParams)

    // THEN
    expect(messages).toStrictEqual([message])
  })
})
