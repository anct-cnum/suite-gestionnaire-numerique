import * as nextCache from 'next/cache'

import { ajouterUnComiteAction } from './ajouterUnComiteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AjouterUnComite } from '@/use-cases/commands/AjouterUnComite'

describe('ajouter un comité action', () => {
  it('quand un comité est ajouté avec tous ses champs, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.stubGlobal('Date', FrozenDate)
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(AjouterUnComite.prototype, 'execute').mockResolvedValueOnce('OK')

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
    expect(AjouterUnComite.prototype.execute).toHaveBeenCalledWith({
      commentaire: 'commentaire',
      date: '2024-01-01T00:00:00.000Z',
      frequence: 'Mensuelle',
      type: 'Stratégique',
      uidGouvernance: 'gouvernanceFooId',
      uidUtilisateur: 'userFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(messages).toStrictEqual(['OK'])
  })

  it.each([
    {
      actionParams: {
        commentaire: '',
        frequence: 'Mensuelle',
        path: '/gouvernance/11',
        type: 'Stratégique',
        uidGouvernance: 'gouvernanceFooId',
      },
      intention: 'quand un comité est ajouté avec un commentaire vide, alors cela renvoie une erreur',
      message: 'Le commentaire doit contenir au moins 1 caractère',
    },
    {
      actionParams: {
        commentaire: '500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500char500c',
        frequence: 'Mensuelle',
        path: '/gouvernance/11',
        type: 'Stratégique',
        uidGouvernance: 'gouvernanceFooId',
      },
      intention: 'quand un comité est ajouté avec un commentaire excedant 500 caractères, alors cela renvoie une erreur',
      message: 'Le commentaire doit contenir au maximum 500 caractères',
    },
    {
      actionParams: {
        date: '01-01-1970',
        frequence: 'Mensuelle',
        path: '/gouvernance/11',
        type: 'Stratégique',
        uidGouvernance: 'gouvernanceFooId',
      },
      intention: 'quand un comité est ajouté avec une date invalide, alors cela renvoie une erreur',
      message: 'La date doit être dans le futur',
    },
    {
      actionParams: {
        date: '1970-01-01',
        frequence: 'Mensuelle',
        path: '/gouvernance/11',
        type: 'Stratégique',
        uidGouvernance: 'gouvernanceFooId',
      },
      intention: 'quand un comité est ajouté avec une date dans le passé, alors cela renvoie une erreur',
      message: 'La date doit être dans le futur',
    },
    {
      actionParams: {
        frequence: 'frequenceInvalide',
        path: '/gouvernance/11',
        type: 'Stratégique',
        uidGouvernance: 'gouvernanceFooId',
      },
      intention: 'quand un comité est ajouté avec une fréquence invalide, alors cela renvoie une erreur',
      message: 'La fréquence du comité est invalide',
    },
    {
      actionParams: {
        frequence: 'Mensuelle',
        path: '/gouvernance/11',
        type: 'Stratégique',
        uidGouvernance: '',
      },
      intention: 'quand un comité est ajouté avec un identifiant de gouvernance non renseigné, alors cela renvoie une erreur',
      message: 'L’identifiant de la gouvernance doit être renseigné',
    },
    {
      actionParams: {
        frequence: 'Mensuelle',
        path: '',
        type: 'Stratégique',
        uidGouvernance: 'gouvernanceFooId',
      },
      intention: 'quand un comité est ajouté avec un chemin de page non renseigné, alors cela renvoie une erreur',
      message: 'Le chemin doit être renseigné',
    },
    {
      actionParams: {
        frequence: 'Mensuelle',
        path: '/gouvernance/11',
        type: 'typeInvalide',
        uidGouvernance: 'gouvernanceFooId',
      },
      intention: 'quand un comité est ajouté avec un type non renseigné, alors cela renvoie une erreur',
      message: 'Le type de comité est invalide',
    },
  ])('$intention', async ({ actionParams, message }) => {
    // GIVEN
    vi.stubGlobal('Date', FrozenDate)

    // WHEN
    const messages = await ajouterUnComiteAction(actionParams)

    // THEN
    expect(messages).toStrictEqual([message])
  })
})

export class FrozenDate extends Date {
  constructor(date: number | string | Date) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    super(date ?? '1996-04-15T03:24:00')
  }
}
