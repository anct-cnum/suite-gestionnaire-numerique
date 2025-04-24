import * as nextCache from 'next/cache'
import nodemailer from 'nodemailer'

import { inviterUnUtilisateurAction } from './inviterUnUtilisateurAction'
import { utilisateurFactory } from '@/domain/testHelper'
import * as invitationEmail from '@/gateways/invitationEmail'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { InviterUnUtilisateur } from '@/use-cases/commands/InviterUnUtilisateur'

describe('inviter un utilisateur action', () => {
  describe('étant donné une invitation valide quand on invite un utilisateur alors cela invite l’utilisateur', () => {
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'

    it.each([
      {
        actionParams: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          path: '/mes-utilisateurs',
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
          path: '/mes-utilisateurs',
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
          codeOrganisation: '21',
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          path: '/mes-utilisateurs',
          prenom: 'Martin',
          role: 'Gestionnaire structure',
        },
        desc: 'avec rôle et organisation spécifiés',
        expectedCommand: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          role: {
            codeOrganisation: '21',
            type: 'Gestionnaire structure',
          },
          uidUtilisateurCourant: sub,
        },
      },
      {
        actionParams: {
          codeOrganisation: '21',
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          path: '/mes-utilisateurs',
          prenom: 'Martin',
        },
        desc: 'avec code organisation spécifiée sans rôle : ignorée',
        expectedCommand: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          uidUtilisateurCourant: sub,
        },
      },
    ])('$desc', async ({ actionParams, expectedCommand }) => {
      // GIVEN
      vi.spyOn(InviterUnUtilisateur.prototype, 'handle').mockResolvedValueOnce('OK')
      vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce(sub)
      vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

      // WHEN
      const messages = await inviterUnUtilisateurAction(actionParams)

      // THEN
      expect(InviterUnUtilisateur.prototype.handle).toHaveBeenCalledWith(expectedCommand)
      expect(nextCache.revalidatePath).toHaveBeenCalledWith(actionParams.path)
      expect(messages).toStrictEqual(['OK'])
    })
  })

  it('étant donné une invitation valide quand on invite un utilisateur qui existe déjà alors cela renvoie une erreur', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce(sub)
    vi.spyOn(InviterUnUtilisateur.prototype, 'handle').mockResolvedValueOnce('emailExistant')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

    const inviterUnUtilisateurParams = {
      codeOrganisation: '21',
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      path: '/',
      prenom: 'Martin',
      role: 'Gestionnaire département',
    }

    // WHEN
    const messages = await inviterUnUtilisateurAction(inviterUnUtilisateurParams)

    // THEN
    expect(messages).toStrictEqual(['emailExistant'])
  })

  describe('étant donné une invitation avec des données invalides, quand on invite un utilisateur alors cela renvoie une erreur', () => {
    it.each([
      {
        desc: 'nom vide',
        email: 'martin.tartempion@example.com',
        expectedError: 'Le nom doit contenir au moins 1 caractère',
        nom: '',
        path: '/',
        prenom: 'Martin',
      },
      {
        desc: 'prénom vide',
        email: 'martin.tartempion@example.com',
        expectedError: 'Le prénom doit contenir au moins 1 caractère',
        nom: 'Tartempion',
        path: '/',
        prenom: '',
      },
      {
        desc: 'email vide',
        email: '',
        expectedError: 'L’email doit être valide',
        nom: 'Tartempion',
        path: '/',
        prenom: 'Martin',
      },
      {
        desc: 'rôle invalide',
        email: 'martin.tartempion@example.com',
        expectedError: 'Le rôle n’est pas correct',
        nom: 'Tartempion',
        path: '/',
        prenom: 'Martin',
        role: 'Rôle bidon',
      },
      {
        codeOrganisation: '',
        desc: 'code organisation vide',
        email: 'martin.tartempion@example.com',
        expectedError: 'Le code organisation doit être renseigné',
        nom: 'Tartempion',
        path: '/',
        prenom: 'Martin',
      },
      {
        desc: 'chemin vide',
        email: 'martin.tartempion@example.com',
        expectedError: 'Le chemin doit être renseigné',
        nom: 'Tartempion',
        path: '',
        prenom: 'Martin',
      },
    ])('$desc', async ({ codeOrganisation, email, expectedError, nom, path, prenom, role }) => {
      // GIVEN
      const inviterUnUtilisateurParams = {
        codeOrganisation,
        email,
        nom,
        path,
        prenom,
        role,
      }

      // WHEN
      const messages = await inviterUnUtilisateurAction(inviterUnUtilisateurParams)

      // THEN
      expect(messages).toStrictEqual([expectedError])
    })
  })

  describe(
    '[URL] étant donné que le paramétrage de l’envoi de l’email d’invitation diffère selon que l’utilisateur à l’origine de l’invitation est ou n’est pas un "super admin"',
    () => {
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
      ])(
        '$desc, alors l’email est envoyé avec le paramétrage approprié',
        async ({ expectedParams, isSuperAdmin }) => {
          // GIVEN
          vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
          vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('sub')
          vi.spyOn(PrismaUtilisateurRepository.prototype, 'get').mockResolvedValueOnce(
            utilisateurFactory({ isSuperAdmin })
          )
          vi.spyOn(PrismaUtilisateurRepository.prototype, 'add').mockResolvedValueOnce(true)
          const spiedMailerTransport = vi.spyOn(nodemailer, 'createTransport')
          const spiedMakeMjml = vi.spyOn(invitationEmail, 'makeMjml')

          // WHEN
          await inviterUnUtilisateurAction({
            codeOrganisation: '21',
            email: 'martin.tartempion@example.com',
            nom: 'Tartempion',
            path: '/',
            prenom: 'Martin',
          })

          // THEN
          expect(spiedMailerTransport).toHaveBeenCalledWith(expectedParams)
          expect(spiedMakeMjml).toHaveBeenCalledWith('http://example.com')
        }
      )
    }
  )
})
