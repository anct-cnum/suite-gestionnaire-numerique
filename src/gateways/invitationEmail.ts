
// eslint-disable-next-line import/no-restricted-paths
import { invitationEmailTemplate } from './emails/invitationEmail'

export const smtpFrom = 'communication@email.conseiller-numerique.gouv.fr'

export const smtpReplyTo = 'conseiller-numerique@anct.gouv.fr'

const logoFrUrl = `${process.env.NEXTAUTH_URL  }/fr.svg`
const logoAnctUrl = `${process.env.NEXTAUTH_URL  }/anct-texte.svg`
const logominUrl = `${process.env.NEXTAUTH_URL  }/min-texte.svg`
export function makeMjml(link: string): string {
  return invitationEmailTemplate
    .replaceAll('<%= link %>', link)
    .replaceAll('<%= logoFrUrl %>', logoFrUrl)
    .replaceAll('<%= logoAnctUrl %>', logoAnctUrl)
    .replaceAll('<%= logominUrl %>', logominUrl)
}
