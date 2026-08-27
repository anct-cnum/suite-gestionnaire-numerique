// eslint-disable devrait être inutile mais la configuration ne fonctionne pas sans ça
/* eslint-disable import/no-restricted-paths */
import * as Sentry from '@sentry/nextjs'
import mjml2html from 'mjml'
import nodemailer from 'nodemailer'

import {
  confirmationLabellisationEmailSubject,
  makeConfirmationLabellisationMjml,
} from './confirmationLabellisationEmail'
import { smtpFrom, smtpReplyTo } from './invitationEmail'
import prisma from '../../prisma/prismaClient'
import { EmailConfirmationLabellisationGateway } from '@/use-cases/commands/AttesterLabellisationStructure'

export class NodemailerEmailConfirmationLabellisationGateway implements EmailConfirmationLabellisationGateway {
  readonly #captureException: typeof Sentry.captureException
  readonly #dataResource = prisma.main_structure_administrative
  readonly #host: string
  readonly #link: string
  readonly #password: string
  readonly #port: string
  readonly #user: string

  constructor(
    host: string,
    port: string,
    link: string,
    user = '',
    password = '',
    captureException: typeof Sentry.captureException = Sentry.captureException
  ) {
    this.#host = host
    this.#port = port
    this.#link = link
    this.#user = user
    this.#password = password
    this.#captureException = captureException
  }

  // Ne lève jamais : un échec d'envoi est tracé techniquement et n'annule pas la labellisation.
  async envoyer(confirmation: Readonly<{ dateRenouvellement: Date; structureId: number }>): Promise<void> {
    try {
      const structure = await this.#dataResource.findUniqueOrThrow({
        include: {
          contact_structures: {
            include: {
              contact: true,
            },
          },
        },
        where: {
          id: confirmation.structureId,
        },
      })
      const nomStructure = structure.denomination_antenne ?? structure.denomination_sirene ?? ''

      const authParams = this.#user === '' ? {} : { auth: { pass: this.#password, user: this.#user } }
      // eslint-disable-next-line import/no-named-as-default-member
      const mailSender = nodemailer.createTransport({
        // @ts-expect-error
        host: this.#host,
        port: this.#port,
        secure: false,
        ...authParams,
      })

      await Promise.all(
        structure.contact_structures.map(async ({ contact }) =>
          mailSender.sendMail({
            from: smtpFrom,
            html: (
              await mjml2html(
                makeConfirmationLabellisationMjml({
                  dateRenouvellement: confirmation.dateRenouvellement,
                  link: this.#link,
                  nom: contact.nom,
                  nomStructure,
                  prenom: contact.prenom,
                })
              )
            ).html,
            replyTo: smtpReplyTo,
            subject: confirmationLabellisationEmailSubject,
            to: contact.email,
          })
        )
      )
    } catch (error) {
      this.#captureException(error, {
        extra: {
          structureId: confirmation.structureId,
        },
        tags: {
          location: 'gateway',
          type: 'EMAIL_SEND_ERROR',
        },
      })
    }
  }
}
