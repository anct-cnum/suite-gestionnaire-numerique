import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { construireBlocs } from '../../blocsTableauDeBord'
import { blocsParContexte } from '../../registreBlocs'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { nomDepartement } from '@/shared/urlHelpers'
import { perimetreRechercheDuContexte } from '@/use-cases/queries/PerimetreRechercheTerritoire'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordGouvernanceController({ params }: Props): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const { code } = await params

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findById(await getSessionUtilisateurId())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const codesDepartements = contexte.codesDepartements()
  const perimetre = perimetreRechercheDuContexte(contexte)

  // Accès aligné sur le périmètre de recherche (source d'autorité unique) : un territoire
  // proposé par le sélecteur est toujours navigable. On conserve codesDepartements() pour
  // les rôles sans périmètre de recherche (ex. gestionnaire_region).
  const dansPerimetre =
    perimetre !== null && (perimetre.type === 'complet' || perimetre.codesDepartement.includes(code))

  if (!(dansPerimetre || codesDepartements.includes(code) || contexte.aCesRoles('administrateur_dispositif'))) {
    redirect('/tableau-de-bord')
  }

  const territoire = { code, type: 'departement' } as const
  const blocs = blocsParContexte(contexte, territoire.type)
  const blocsElements = construireBlocs({ contexte, perimetre, prenom: utilisateur.prenom, territoire })

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: nomDepartement(code) }]} />
      {blocs.map((bloc) => blocsElements[bloc])}
    </>
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{ code: string }>>
}>
