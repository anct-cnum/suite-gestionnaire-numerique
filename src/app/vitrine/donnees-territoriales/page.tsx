import { Metadata } from 'next'
import { ReactElement } from 'react'

import DonneesTerritoriales from '@/components/vitrine/DonneesTerritoriales/DonneesTerritoriales'

export const metadata: Metadata = {
  description: 'Accédez aux données publiques d\'inclusion numérique par territoire en France. Statistiques sur les lieux d\'inclusion, médiateurs numériques, feuilles de route et accompagnements réalisés par département.',
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
    description: 'Accédez aux données publiques d\'inclusion numérique par territoire en France.',
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

export default function DonneesTerritorialesController(): ReactElement {
  return <DonneesTerritoriales />
}
