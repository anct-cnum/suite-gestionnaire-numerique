// eslint-disable devrait être inutile mais la configuration ne fonctionne pas sans ça
/* eslint-disable import/no-restricted-paths */
import { readFileSync } from 'fs'
import mjml2html from 'mjml'
import nodemailer from 'nodemailer'
import { join } from 'path'

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

    // WHEN
    const invitationEmail = readFileSync(join(__dirname, 'emails/invitationEmail.mjml'), 'utf-8').replace(
      '<%= link %>',
      'localhost:3000/connexion'
    )

    await emailInvitationGateway.send(destinataire)

    // THEN
    expect(spiedCreateTransport).toHaveBeenCalledWith(transport)
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'communication@email.conseiller-numerique.gouv.fr',
      html: mjml2html(invitationEmail).html,
      replyTo: 'conseiller-numerique@anct.gouv.fr',
      subject: 'Bienvenue sur Mon Inclusion Numérique',
      to: 'martin.tartempion@example.com',
    })
  })
})

