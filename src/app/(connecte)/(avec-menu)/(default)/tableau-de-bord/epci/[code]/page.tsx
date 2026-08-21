import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { construireBlocs } from '../../blocsTableauDeBord'
import { blocsParContexte } from '../../registreBlocs'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaScopeTerritorialLoader } from '@/gateways/PrismaScopeTerritorialLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { perimetreRechercheDuContexte } from '@/use-cases/queries/PerimetreRechercheTerritoire'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordEpciController({ params }: Props): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const { code } = await params

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findById(await getSessionUtilisateurId())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const perimetre = perimetreRechercheDuContexte(contexte)

  const epci = await new PrismaScopeTerritorialLoader().getEpci(code)
  if (epci === null) {
    notFound()
  }

  // Accès aligné sur le périmètre de recherche (source d'autorité unique) : admin, ou EPCI dont
  // le département de rattachement fait partie du périmètre de l'utilisateur.
  const dansPerimetre =
    perimetre !== null &&
    (perimetre.type === 'complet' ||
      (epci.codeDepartement !== null && perimetre.codesDepartement.includes(epci.codeDepartement)))

  if (!dansPerimetre) {
    redirect('/tableau-de-bord')
  }

  const territoire = {
    bbox: epci.bbox,
    code,
    codesInsee: epci.codesInsee,
    nom: epci.nom,
    type: 'epci',
  } as const
  const blocs = blocsParContexte(contexte, territoire.type)
  const blocsElements = construireBlocs({ contexte, perimetre, prenom: utilisateur.prenom, territoire })

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: epci.nom }]} />
      {blocs.map((bloc) => blocsElements[bloc])}
    </>
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{ code: string }>>
}>
