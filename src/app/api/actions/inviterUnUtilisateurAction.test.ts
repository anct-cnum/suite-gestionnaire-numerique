import { inviterUnUtilisateurAction } from './inviterUnUtilisateurAction'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'
import { ssoProfileFactory } from '@/gateways/testHelper'
import { InviterUnUtilisateur } from '@/use-cases/commands/InviterUnUtilisateur'

describe('inviter un utilisateur action', () => {
  describe('étant donné une invitation valide quand on invite un utilisateur alors cela invite l’utilisateur', () => {
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'

    it.each([
      {
        actionParams: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
        },
        desc: 'sans rôle spécifié',
        expectedCommand: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          uidUtilisateurCourant: sub,
        },
      },
      {
        actionParams: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          role: 'Instructeur',
        },
        desc: 'avec rôle spécifié',
        expectedCommand: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          role: {
            type: 'Instructeur',
          },
          uidUtilisateurCourant: sub,
        },
      },
      {
        actionParams: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          organisation: 'La Poste',
          prenom: 'Martin',
          role: 'Gestionnaire structure',
        },
        desc: 'avec rôle et organisation spécifiés',
        expectedCommand: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          role: {
            organisation: 'La Poste',
            type: 'Gestionnaire structure',
          },
          uidUtilisateurCourant: sub,
        },
      },
    ])('$desc', async ({ actionParams, expectedCommand }) => {
      // GIVEN
      // @ts-expect-error
      vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: { sub } })
      vi.spyOn(InviterUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('OK')

      // WHEN
      const result = await inviterUnUtilisateurAction(actionParams)

      // THEN
      expect(InviterUnUtilisateur.prototype.execute).toHaveBeenCalledWith(expectedCommand)
      expect(result).toBe('OK')
    })
  })

  it('étant donné une invitation valide quand on invite un utilisateur qui existe déjà alors cela renvoie une erreur', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(ssoProfileFactory({ sub }))
    vi.spyOn(InviterUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('emailExistant')

    const inviterUnUtilisateurParams = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      organisation: 'La Poste',
      prenom: 'Martin',
      role: 'Gestionnaire département',
    }

    // WHEN
    const result = await inviterUnUtilisateurAction(inviterUnUtilisateurParams)

    // THEN
    expect(result).toBe('emailExistant')
  })

  it('étant donné une invitation avec un rôle invalide quand on invite un utilisateur alors cela renvoie une erreur', async () => {
    // GIVEN
    const inviterUnUtilisateurParams = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      organisation: 'La Poste',
      prenom: 'Martin',
      role: 'Rôle bidon',
    }

    // WHEN
    const result = await inviterUnUtilisateurAction(inviterUnUtilisateurParams)

    // THEN
    // @ts-expect-error
    expect(result[0].message).toBe('Le rôle n’est pas correct')
  })
})
