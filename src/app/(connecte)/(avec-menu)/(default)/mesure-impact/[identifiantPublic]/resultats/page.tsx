import { Metadata } from 'next'
import { forbidden, notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { structureDeLaMesureDImpact } from '@/app/shared/structurePorteUneCampagne'
import Resultats from '@/components/mesure-impact/Resultats/Resultats'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { Canal } from '@/domain/mesure-impact/Questionnaire'
import { Filtres } from '@/domain/mesure-impact/Resultats'
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

// Un filtre vide ou mal formé est ignoré : les résultats portent alors sur toute la campagne
function filtresDeLAdresse({ canal, codePostal, mois }: ParametresDeRecherche): Filtres {
  return {
    ...(CANAUX.some((candidat) => candidat === canal) ? { canal: canal as Canal } : {}),
    ...(typeof codePostal === 'string' && /^\d{5}$/.test(codePostal) ? { codePostal } : {}),
    ...(typeof mois === 'string' && /^\d{4}-\d{2}$/.test(mois) ? { mois } : {}),
  }
}

const CANAUX: ReadonlyArray<Canal> = ['en-ligne', 'papier', 'telephone']

type ParametresDeRecherche = Readonly<Partial<Record<'canal' | 'codePostal' | 'mois', ReadonlyArray<string> | string>>>

type Props = Readonly<{
  params: Promise<{ identifiantPublic: string }>
  searchParams: Promise<ParametresDeRecherche>
}>
