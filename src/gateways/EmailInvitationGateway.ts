import mjml2html from 'mjml'
import nodemailer from 'nodemailer'

import { smtpFrom, smtpReplyTo, makeHtml } from './invitationEmail'
import { EmailGateway } from '../use-cases/commands/InviterUnUtilisateur'

export class EmailInvitationGateway implements EmailGateway {
  readonly #host: string
  readonly #port: string
  readonly #user: string
  readonly #password: string
  readonly #link: string

  constructor(host: string, port: string, link: string, user = '', password = '') {
    this.#host = host
    this.#port = port
    this.#link = link
    this.#user = user
    this.#password = password
  }
  async send(destinataire: string): Promise<void> {
    const authParams = this.#user !== '' ? { auth: { pass: this.#password, user: this.#user } } : {}
    const mailSender = nodemailer.createTransport({
      // @ts-expect-error
      host: this.#host,
      port: this.#port,
      secure: false,
      ...authParams,
    })
    await mailSender.sendMail({
      from: smtpFrom,
      html: mjml2html(makeHtml(this.#link)).html,
      replyTo: smtpReplyTo,
      subject: 'Bienvenue sur votre nouveau tableau de pilotage Conseiller numérique',
      to: destinataire,
    })
  }
}
