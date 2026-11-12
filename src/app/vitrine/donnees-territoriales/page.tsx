import { Metadata } from 'next'
import { ReactElement } from 'react'

import DonneesTerritoriales from '@/components/vitrine/DonneesTerritoriales/DonneesTerritoriales'
import { PrismaRechercheTerritoiresLoader } from '@/gateways/PrismaRechercheTerritoiresLoader'
import { listeDepartementsPresenter } from '@/presenters/listeDepartementsPresenter'
import { ListerDepartementsParRegion } from '@/use-cases/queries/ListerDepartementsParRegion'

export const metadata: Metadata = {
  description:
    "Accédez aux données publiques d'inclusion numérique par territoire en France. Statistiques sur les lieux d'inclusion, médiateurs numériques, feuilles de route et accompagnements réalisés par département.",
  keywords: [
    'inclusion numérique',
    'données territoriales',
    'France',
    'départements',
    'statistiques',
    'médiateurs numériques',
    'accompagnement numérique',
    'feuille de route',
    'France Numérique Ensemble',
  ],
  openGraph: {
    description: "Accédez aux données publiques d'inclusion numérique par territoire en France.",
    locale: 'fr_FR',
    siteName: 'Inclusion Numérique',
    title: 'Données territoriales - Inclusion Numérique',
    type: 'website',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: 'Données territoriales - Inclusion Numérique',
}

export default async function DonneesTerritorialesController(): Promise<ReactElement> {
  const readModel = await new ListerDepartementsParRegion(new PrismaRechercheTerritoiresLoader()).handle()
  return <DonneesTerritoriales departements={listeDepartementsPresenter(readModel)} />
}
