import * as nextCache from 'next/cache'

import { ajouterUnComiteAction } from './ajouterUnComiteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'

describe('ajouter un comité action', () => {
  describe('étant donné un nouveau comité valide quand on l’ajoute, alors cela ajoute un nouveau comité', () => {
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'

    it.each([
      {
        actionParams: {
          frequence: 'mensuelle',
          gouvernanceId: '1',
          type: 'strategique',
        },
        desc: 'avec les champs obligatoires',
        expectedPath: '/gouvernance/1',
      },
      {
        actionParams: {
          date: '01-01-1970',
          frequence: 'mensuelle',
          gouvernanceId: '1',
          type: 'strategique',
        },
        desc: 'avec les champs obligatoires et la date',
        expectedPath: '/gouvernance/1',
      },
      {
        actionParams: {
          commentaire: 'commentaire',
          date: '01-01-1970',
          frequence: 'mensuelle',
          gouvernanceId: '1',
          type: 'strategique',
        },
        desc: 'avec tous les champs renseignés',
        expectedPath: '/gouvernance/1',
      },
    ])('$desc', async ({ actionParams, expectedPath }) => {
      // GIVEN
      vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
      vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

      // WHEN
      const messages = await ajouterUnComiteAction(actionParams)

      // THEN
      expect(nextCache.revalidatePath).toHaveBeenCalledWith(expectedPath)
      expect(messages).toStrictEqual(['OK'])
    })
  })

  describe('étant donné un comité avec des données invalides, quand on l’ajoute, alors cela renvoie une erreur', () => {
    it.each([
      {
        desc: 'type de comité vide',
        expectedError: 'Le type de comité doit être renseigné',
        frequence: 'mensuelle',
        gouvernanceId: '1',
        type: '',
      },
      {
        desc: 'fréquence de comité vide',
        expectedError: 'La fréquence du comité doit être renseignée',
        frequence: '',
        gouvernanceId: '1',
        type: 'strategique',
      },
    ])('$desc', async ({ frequence, type, gouvernanceId, expectedError }) => {
      // GIVEN
      const ajouterUnComiteParams = { frequence, gouvernanceId, type }

      // WHEN
      const messages = await ajouterUnComiteAction(ajouterUnComiteParams)

      // THEN
      expect(messages).toStrictEqual([expectedError])
    })
  })
})
