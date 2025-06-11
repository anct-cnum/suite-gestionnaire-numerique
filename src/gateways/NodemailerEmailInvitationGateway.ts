// eslint-disable devrait être inutile mais la configuration ne fonctionne pas sans ça
/* eslint-disable import/no-restricted-paths */
import mjml2html from 'mjml'
import nodemailer from 'nodemailer'

import { Destinataire } from './emails/invitationEmail'
import { makeMjml, smtpFrom, smtpReplyTo } from './invitationEmail'
import { EmailGateway } from '@/use-cases/commands/shared/EmailGateway'

export class NodemailerEmailInvitationGateway implements EmailGateway {
  readonly #host: string
  readonly #link: string
  readonly #password: string
  readonly #port: string
  readonly #user: string

  constructor(host: string, port: string, link: string, user = '', password = '') {
    this.#host = host
    this.#port = port
    this.#link = link
    this.#user = user
    this.#password = password
  }

  async send(destinataire: Destinataire): Promise<void> {
    const authParams = this.#user === '' ? {} : { auth: { pass: this.#password, user: this.#user } }
    // eslint-disable-next-line import/no-named-as-default-member
    const mailSender = nodemailer.createTransport({
      // @ts-expect-error
      host: this.#host,
      port: this.#port,
      secure: false,
      ...authParams,
    })
    const connexionUrl = `${this.#link}/connexion`
    await mailSender.sendMail({
      from: smtpFrom,
      html: mjml2html(makeMjml(connexionUrl, destinataire)).html,
      replyTo: smtpReplyTo,
      subject: 'Vous avez été invité à rejoindre Mon Inclusion Numérique',
      to: destinataire.email,
    })
  }
}
