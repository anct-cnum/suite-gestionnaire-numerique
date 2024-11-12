import nodemailer from 'nodemailer'
import { ZodIssue } from 'zod'

import { inviterUnUtilisateurAction } from './inviterUnUtilisateurAction'
import { utilisateurFactory } from '@/domain/testHelper'
import * as invitationEmail from '@/gateways/invitationEmail'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import * as ssoGateway from '@/gateways/ProConnectAuthentificationGateway'
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
      {
        actionParams: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          organisation: 'La Poste',
          prenom: 'Martin',
        },
        desc: 'avec organisation spécifiée sans rôle : ignorée',
        expectedCommand: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          uidUtilisateurCourant: sub,
        },
      },
    ])('$desc', async ({ actionParams, expectedCommand }) => {
      // GIVEN
      vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
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
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
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

  describe('étant donné une invitation avec des données invalides, quand on invite un utilisateur alors cela renvoie une erreur', () => {
    it.each([
      {
        desc: 'nom vide',
        email: 'martin.tartempion@example.com',
        expectedError: 'Le nom doit contenir au moins 1 caractère',
        nom: '',
        prenom: 'Martin',
      },
      {
        desc: 'prénom vide',
        email: 'martin.tartempion@example.com',
        expectedError: 'Le prénom doit contenir au moins 1 caractère',
        nom: 'Tartempion',
        prenom: '',
      },
      {
        desc: 'email vide',
        email: '',
        expectedError: 'L’email doit être valide',
        nom: 'Tartempion',
        prenom: 'Martin',
      },
      {
        desc: 'rôle invalide',
        email: 'martin.tartempion@example.com',
        expectedError: 'Le rôle n’est pas correct',
        nom: 'Tartempion',
        prenom: 'Martin',
        role: 'Rôle bidon',
      },
      {
        desc: 'organisation vide',
        email: 'martin.tartempion@example.com',
        expectedError: 'L’organisation doit être renseignée',
        nom: 'Tartempion',
        organisation: '',
        prenom: 'Martin',
      },
    ])('$desc', async ({ email, nom, prenom, role, organisation, expectedError }) => {
      // GIVEN
      const inviterUnUtilisateurParams = {
        email,
        nom,
        organisation,
        prenom,
        role,
      }

      // WHEN
      const result = await inviterUnUtilisateurAction(inviterUnUtilisateurParams)

      // THEN
      expect((result as ReadonlyArray<ZodIssue>)[0].message).toBe(expectedError)
    })
  })

  describe(
    'étant donné que le paramétrage de l’envoi de l’email d’invitation diffère selon que l’utilisateur à l’origine de'
    + ' l’invitation est ou n’est pas un "super admin"', () => {
      it.each([
        {
          desc: 'quand l’email est envoyé par un super admin',
          expectedParams: {
            auth: undefined,
            host: '0.0.0.0',
            port: '1025',
            secure: false,
          },
          isSuperAdmin: true,
        },
        {
          desc: 'quand l’email est envoyé par un utilisateur qui n’est pas un super admin',
          expectedParams: {
            auth: undefined,
            host: '0.0.0.0',
            port: '1025',
            secure: false,
          },

          isSuperAdmin: false,
        },
      ])('$desc, alors l’email est envoyé avec le paramétrage approprié', async ({ expectedParams, isSuperAdmin }) => {
        // GIVEN
        vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(('sub'))
        vi.spyOn(PostgreUtilisateurRepository.prototype, 'find').mockResolvedValueOnce(utilisateurFactory({ isSuperAdmin }))
        vi.spyOn(PostgreUtilisateurRepository.prototype, 'add').mockResolvedValueOnce(true)
        const spiedMailerTransport = vi.spyOn(nodemailer, 'createTransport')
        const spiedMakeMjml = vi.spyOn(invitationEmail, 'makeMjml')

        // WHEN
        await inviterUnUtilisateurAction({
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          organisation: 'La Poste',
          prenom: 'Martin',
        })

        // THEN
        expect(spiedMailerTransport).toHaveBeenCalledWith(expectedParams)
        expect(spiedMakeMjml).toHaveBeenCalledWith('http://example.com')
      })
    }
  )
})
