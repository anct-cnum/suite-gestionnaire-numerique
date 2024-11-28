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
          emailDeContact: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
        },
        desc: 'sans rôle spécifié',
        expectedCommand: {
          emailDeContact: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          uidUtilisateurCourant: sub,
        },
      },
      {
        actionParams: {
          emailDeContact: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          role: 'Instructeur',
        },
        desc: 'avec rôle spécifié',
        expectedCommand: {
          emailDeContact: 'martin.tartempion@example.com',
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
          emailDeContact: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          role: 'Gestionnaire structure',
        },
        desc: 'avec rôle et organisation spécifiés',
        expectedCommand: {
          emailDeContact: 'martin.tartempion@example.com',
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
          emailDeContact: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
        },
        desc: 'avec code organisation spécifiée sans rôle : ignorée',
        expectedCommand: {
          emailDeContact: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          uidUtilisateurCourant: sub,
        },
      },
    ])('$desc', async ({ actionParams, expectedCommand }) => {
      // GIVEN
      vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
      vi.spyOn(InviterUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('OK')
      vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())

      // WHEN
      const messages = await inviterUnUtilisateurAction(actionParams)

      // THEN
      expect(nextCache.revalidatePath).toHaveBeenCalledWith('/mes-utilisateurs')
      expect(InviterUnUtilisateur.prototype.execute).toHaveBeenCalledWith(expectedCommand)
      expect(messages).toStrictEqual(['OK'])
    })
  })

  it('étant donné une invitation valide quand on invite un utilisateur qui existe déjà alors cela renvoie une erreur', async () => {
    // GIVEN
    const sub = 'd96a66b5-8980-4e5c-88a9-aa0ff334a828'
    vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce(sub)
    vi.spyOn(InviterUnUtilisateur.prototype, 'execute').mockResolvedValueOnce('emailExistant')

    const inviterUnUtilisateurParams = {
      codeOrganisation: '21',
      emailDeContact: 'martin.tartempion@example.com',
      nom: 'Tartempion',
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
        emailDeContact: 'martin.tartempion@example.com',
        expectedError: 'Le nom doit contenir au moins 1 caractère',
        nom: '',
        prenom: 'Martin',
      },
      {
        desc: 'prénom vide',
        emailDeContact: 'martin.tartempion@example.com',
        expectedError: 'Le prénom doit contenir au moins 1 caractère',
        nom: 'Tartempion',
        prenom: '',
      },
      {
        desc: 'email vide',
        emailDeContact: '',
        expectedError: 'L’email doit être valide',
        nom: 'Tartempion',
        prenom: 'Martin',
      },
      {
        desc: 'rôle invalide',
        emailDeContact: 'martin.tartempion@example.com',
        expectedError: 'Le rôle n’est pas correct',
        nom: 'Tartempion',
        prenom: 'Martin',
        role: 'Rôle bidon',
      },
      {
        codeOrganisation: '',
        desc: 'code organisation vide',
        emailDeContact: 'martin.tartempion@example.com',
        expectedError: 'Le code organisation doit être renseigné',
        nom: 'Tartempion',
        prenom: 'Martin',
      },
    ])('$desc', async ({ emailDeContact: emailDeContact, nom, prenom, role, codeOrganisation, expectedError }) => {
      // GIVEN
      const inviterUnUtilisateurParams = {
        codeOrganisation,
        emailDeContact: emailDeContact,
        nom,
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
    'étant donné que le paramétrage de l’envoi de l’email d’invitation diffère selon que l’utilisateur à l’origine de' +
      ' l’invitation est ou n’est pas un "super admin"',
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
          vi.spyOn(ssoGateway, 'getSubSession').mockResolvedValueOnce('sub')
          vi.spyOn(PrismaUtilisateurRepository.prototype, 'find').mockResolvedValueOnce(
            utilisateurFactory({ isSuperAdmin })
          )
          vi.spyOn(PrismaUtilisateurRepository.prototype, 'add').mockResolvedValueOnce(true)
          const spiedMailerTransport = vi.spyOn(nodemailer, 'createTransport')
          const spiedMakeMjml = vi.spyOn(invitationEmail, 'makeMjml')

          // WHEN
          await inviterUnUtilisateurAction({
            codeOrganisation: '21',
            emailDeContact: 'martin.tartempion@example.com',
            nom: 'Tartempion',
            prenom: 'Martin',
          })

          // THEN
          expect(nextCache.revalidatePath).toHaveBeenCalledWith('/mes-utilisateurs')
          expect(spiedMailerTransport).toHaveBeenCalledWith(expectedParams)
          expect(spiedMakeMjml).toHaveBeenCalledWith('http://example.com')
        }
      )
    }
  )
})
