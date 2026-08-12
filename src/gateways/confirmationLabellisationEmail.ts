// eslint-disable-next-line import/no-restricted-paths
import { confirmationLabellisationEmailTemplate } from './emails/confirmationLabellisationEmail'

export const confirmationLabellisationEmailSubject = 'Votre structure est labellisée Conseiller Numérique'

const logoConumUrl = `${process.env.NEXTAUTH_URL}/conum-full.svg`
const logoAnctUrl = `${process.env.NEXTAUTH_URL}/anct-texte.svg`

export function makeConfirmationLabellisationMjml(
  params: Readonly<{
    dateRenouvellement: Date
    link: string
    nom: string
    nomStructure: string
    prenom: string
  }>
): string {
  return confirmationLabellisationEmailTemplate
    .replaceAll('<%= link %>', params.link)
    .replaceAll('<%= logoConumUrl %>', logoConumUrl)
    .replaceAll('<%= logoAnctUrl %>', logoAnctUrl)
    .replaceAll('<%= prenom %>', params.prenom)
    .replaceAll('<%= nom %>', params.nom)
    .replaceAll('<%= nomStructure %>', params.nomStructure)
    .replaceAll(
      '<%= dateRenouvellement %>',
      params.dateRenouvellement.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    )
}
