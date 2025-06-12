// eslint-disable-next-line import/no-restricted-paths
import { Destinataire, invitationEmailTemplate } from './emails/invitationEmail'

export const smtpFrom = 'communication@email.conseiller-numerique.gouv.fr'

export const smtpReplyTo = 'societe.numerique@anct.gouv.fr'

const logoFrUrl = `${process.env.NEXTAUTH_URL  }/fr.svg`
const logoAnctUrl = `${process.env.NEXTAUTH_URL  }/anct-texte.svg`
const logominUrl = `${process.env.NEXTAUTH_URL  }/min-texte.svg`
const linkAide = 'https://outline.incubateur.anct.gouv.fr/s/mon-inclusion-numerique-centre-aide'

export function makeMjml(link: string, destinataire: Destinataire): string {
  return invitationEmailTemplate
    .replaceAll('<%= link %>', link)
    .replaceAll('<%= logoFrUrl %>', logoFrUrl)
    .replaceAll('<%= logoAnctUrl %>', logoAnctUrl)
    .replaceAll('<%= logominUrl %>', logominUrl)
    .replaceAll('<%= linkAide %>', linkAide)
    .replaceAll('<%= prenom %>', destinataire.prenom)
    .replaceAll('<%= nom %>', destinataire.nom)
}
