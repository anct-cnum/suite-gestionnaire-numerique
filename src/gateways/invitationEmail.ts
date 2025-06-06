import { readFileSync } from 'fs'
import { join } from 'path'

export const smtpFrom = 'communication@email.conseiller-numerique.gouv.fr'

export const smtpReplyTo = 'conseiller-numerique@anct.gouv.fr'

export function makeMjml(link: string): string {
  const template = readFileSync(join(__dirname, 'emails/invitationEmail.mjml'), 'utf-8')
  return template.replace('<%= link %>', link)
}
