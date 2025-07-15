// eslint-disable devrait être inutile mais la configuration ne fonctionne pas sans ça
/* eslint-disable import/no-restricted-paths */
import mjml2html from 'mjml'
import nodemailer from 'nodemailer'

import { invitationEmailTemplate } from './emails/invitationEmail'
import { NodemailerEmailInvitationGateway } from './NodemailerEmailInvitationGateway'

describe('envoi de mail d’invitation', () => {
  const host = '0.0.0.0'
  const port = '1025'
  const link = 'localhost:3000'
  const user = 'user'
  const pass = 'password'
  const destinataire = 'martin.tartempion@example.com'

  it.each([
    {
      desc: 'envoi d’e-mail sans authentification',
      emailInvitationGateway: new NodemailerEmailInvitationGateway(host, port, link),
      transport: {
        host: '0.0.0.0',
        port: '1025',
        secure: false,
      },
    },
    {
      desc: 'envoi d’e-mail avec authentification',
      emailInvitationGateway: new NodemailerEmailInvitationGateway(host, port, link, user, pass),
      transport: {
        auth: {
          pass: 'password',
          user: 'user',
        },
        host: '0.0.0.0',
        port: '1025',
        secure: false,
      },
    },
  ])('$desc', async ({ emailInvitationGateway, transport }) => {
    // GIVEN
    const mockSendMail = vi.fn<() => void>()
    const spiedCreateTransport = vi
      .spyOn(nodemailer, 'createTransport')
      // @ts-expect-error
      .mockReturnValueOnce({ sendMail: mockSendMail })

    const logoFrUrl = `${process.env.NEXTAUTH_URL  }/fr.svg`
    const logoAnctUrl = `${process.env.NEXTAUTH_URL  }/anct-texte.svg`
    const logominUrl = `${process.env.NEXTAUTH_URL  }/min-texte.svg`
    const linkAide = 'https://outline.incubateur.anct.gouv.fr/s/mon-inclusion-numerique-centre-aide'
    const prenom = 'Martin'
    const nom = 'Tartempion'
    // WHEN
    const invitationEmail = invitationEmailTemplate.replaceAll(
      '<%= link %>',
      'localhost:3000/connexion'
    )
      .replaceAll('<%= logoFrUrl %>', logoFrUrl)
      .replaceAll('<%= logoAnctUrl %>', logoAnctUrl)
      .replaceAll('<%= logominUrl %>', logominUrl)
      .replaceAll('<%= linkAide %>', linkAide)
      .replaceAll('<%= prenom %>', prenom)
      .replaceAll('<%= nom %>', nom)

    await emailInvitationGateway.send({
      email: destinataire,
      nom,
      prenom,
    })

    // THEN
    expect(spiedCreateTransport).toHaveBeenCalledWith(transport)
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'communication@email.conseiller-numerique.gouv.fr',
      html: mjml2html(invitationEmail).html,
      replyTo: 'moninclusionnumerique@anct.gouv.fr',
      subject: 'Vous avez été invité à rejoindre Mon Inclusion Numérique',
      to: 'martin.tartempion@example.com',
    })
  })
})

