
// eslint-disable-next-line import/no-restricted-paths
import { invitationEmailTemplate } from './emails/invitationEmail'

export const smtpFrom = 'communication@email.conseiller-numerique.gouv.fr'

export const smtpReplyTo = 'conseiller-numerique@anct.gouv.fr'

export function makeMjml(link: string): string {
  return invitationEmailTemplate.replace('<%= link %>', link)
}
