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

export default async function TableauDeBordRegionController({ params }: Props): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const { code } = await params

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findById(await getSessionUtilisateurId())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())

  // Maille région : administrateur, ou gestionnaire région sur sa propre région (validation PO #1279).
  const estSaRegion = contexte.aCesRoles('gestionnaire_region') && contexte.codeRegion() === code
  if (!contexte.aCesRoles('administrateur_dispositif') && !estSaRegion) {
    redirect('/tableau-de-bord')
  }

  const region = await new PrismaScopeTerritorialLoader().getRegion(code)
  if (region === null) {
    notFound()
  }

  const perimetre = perimetreRechercheDuContexte(contexte)

  const territoire = {
    bbox: region.bbox,
    code,
    codesDepartement: region.codesDepartement,
    nom: region.nom,
    type: 'region',
  } as const
  const blocs = blocsParContexte(contexte, territoire.type)
  const blocsElements = construireBlocs({ contexte, perimetre, prenom: utilisateur.prenom, territoire })

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: region.nom }]} />
      {blocs.map((bloc) => blocsElements[bloc])}
    </>
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{ code: string }>>
}>
