import mjml2html from 'mjml'
import nodemailer from 'nodemailer'

// eslint-disable-next-line import/no-restricted-paths
import { smtpFrom, smtpReplyTo, makeMjml } from './invitationEmail'
import { EmailGateway } from '@/use-cases/commands/shared/EmailGateway'

export class NodemailerEmailInvitationGateway implements EmailGateway {
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
    const authParams = this.#user === '' ? {} : { auth: { pass: this.#password, user: this.#user } }
    const mailSender = nodemailer.createTransport({
      // @ts-expect-error
      host: this.#host,
      port: this.#port,
      secure: false,
      ...authParams,
    })
    await mailSender.sendMail({
      from: smtpFrom,
      html: mjml2html(makeMjml(this.#link)).html,
      replyTo: smtpReplyTo,
      subject: 'Bienvenue sur Mon Inclusion Numérique',
      to: destinataire,
    })
  }
}
