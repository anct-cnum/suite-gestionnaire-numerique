// eslint-disable devrait être inutile mais la configuration ne fonctionne pas sans ça
/* eslint-disable import/no-restricted-paths */
import * as Sentry from '@sentry/nextjs'
import mjml2html from 'mjml'
import nodemailer from 'nodemailer'
import { describe, expect, it, vi } from 'vitest'

import { makeConfirmationLabellisationMjml } from './confirmationLabellisationEmail'
import { NodemailerEmailConfirmationLabellisationGateway } from './NodemailerEmailConfirmationLabellisationGateway'
import prisma from '../../prisma/prismaClient'
import { epochTime } from '@/shared/testHelper'

describe('envoi de l’email de confirmation de labellisation', () => {
  const host = '0.0.0.0'
  const port = '1025'
  const link = 'localhost:3000'

  it('envoie un email personnalisé à chaque contact de la structure labellisée', async () => {
    // GIVEN
    vi.spyOn(prisma.main_structure_administrative, 'findUniqueOrThrow').mockResolvedValueOnce({
      contact_structures: [
        { contact: { email: 'martin.tartempion@example.com', nom: 'Tartempion', prenom: 'Martin' } },
        { contact: { email: 'julie.dupont@example.com', nom: 'Dupont', prenom: 'Julie' } },
      ],
      denomination_antenne: null,
      denomination_sirene: 'Solidarnum',
    } as never)
    const mockSendMail = vi.fn<() => void>()
    const spiedCreateTransport = vi
      .spyOn(nodemailer, 'createTransport')
      // @ts-expect-error
      .mockReturnValueOnce({ sendMail: mockSendMail })

    // WHEN
    await new NodemailerEmailConfirmationLabellisationGateway(host, port, link).envoyer({
      dateRenouvellement: epochTime,
      structureId: 978,
    })

    // THEN
    expect(spiedCreateTransport).toHaveBeenCalledWith({
      host: '0.0.0.0',
      port: '1025',
      secure: false,
    })
    expect(mockSendMail).toHaveBeenCalledTimes(2)
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'communication@email.conseiller-numerique.gouv.fr',
      html: mjml2html(
        makeConfirmationLabellisationMjml({
          dateRenouvellement: epochTime,
          link,
          nom: 'Tartempion',
          nomStructure: 'Solidarnum',
          prenom: 'Martin',
        })
      ).html,
      replyTo: 'moninclusionnumerique@anct.gouv.fr',
      subject: 'Votre structure est labellisée Conseiller Numérique',
      to: 'martin.tartempion@example.com',
    })
  })

  it('trace techniquement l’erreur sans la propager quand l’envoi échoue', async () => {
    // GIVEN
    const erreur = new Error('SMTP indisponible')
    vi.spyOn(prisma.main_structure_administrative, 'findUniqueOrThrow').mockRejectedValueOnce(erreur)
    const captureException = vi.fn<typeof Sentry.captureException>()

    // WHEN
    await new NodemailerEmailConfirmationLabellisationGateway(host, port, link, '', '', captureException).envoyer({
      dateRenouvellement: epochTime,
      structureId: 978,
    })

    // THEN
    expect(captureException).toHaveBeenCalledWith(erreur, {
      extra: {
        structureId: 978,
      },
      tags: {
        location: 'gateway',
        type: 'EMAIL_SEND_ERROR',
      },
    })
  })
})
