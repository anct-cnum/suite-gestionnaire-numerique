import { Metadata } from 'next'
import { forbidden, notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { filtresDeLAdresse, ParametresDeRecherche } from './filtresDeLAdresse'
import { structureDeLaMesureDImpact } from '@/app/shared/structurePorteUneCampagne'
import Resultats from '@/components/mesure-impact/Resultats/Resultats'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { PrismaReponseLoader } from '@/gateways/mesure-impact/PrismaReponseLoader'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resultatsPresenter } from '@/presenters/mesure-impact/resultatsPresenter'
import { RecupererLesResultats } from '@/use-cases/mesure-impact/RecupererLesResultats'

export const metadata: Metadata = {
  title: 'Résultats – Mesure d’impact',
}

export default async function ResultatsController({ params, searchParams }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const { identifiantPublic } = await params
  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const resultats = await new RecupererLesResultats(new PrismaCampagneLoader(), new PrismaReponseLoader()).handle({
    filtres: filtresDeLAdresse(await searchParams),
    identifiantPublic,
    structureId: structureDeLaMesureDImpact(utilisateur),
  })
  if (resultats === null) {
    notFound()
  }
  if (resultats === 'accesRefuse') {
    forbidden()
  }
  const viewModel = resultatsPresenter(resultats)

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Accueil' },
          { href: '/mesure-impact', label: 'Mesure d’impact' },
          { href: viewModel.lienCampagne, label: viewModel.titreFilAriane },
          { label: 'Résultats' },
        ]}
      />
      <Resultats viewModel={viewModel} />
    </>
  )
}

type Props = Readonly<{
  params: Promise<{ identifiantPublic: string }>
  searchParams: Promise<ParametresDeRecherche>
}>
