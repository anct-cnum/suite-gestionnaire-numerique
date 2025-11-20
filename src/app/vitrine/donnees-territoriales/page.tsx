import { ReactElement } from 'react'

import DonneesTerritoriales from '@/components/vitrine/DonneesTerritoriales/DonneesTerritoriales'

// export const metadata: Metadata = {
// description: 'Découvrez les données publiques d\'inclusion numérique par territoire : départements, régions et 
// national.
// Accédez aux statistiques sur les lieux d\'inclusion, médiateurs numériques et accompagnements réalisés en France.',
//   keywords: [
//     'inclusion numérique',
//     'données territoriales',
//     'France',
//     'départements',
//     'régions',
//     'statistiques',
//     'médiateurs numériques',
//     'accompagnement numérique',
//     'Aidants Connect',
//     'Conseiller Numérique',
//     'France Services',
//   ],
//   openGraph: {
//     description: 'Découvrez les données publiques d\'inclusion numérique par territoire en France',
//     locale: 'fr_FR',
//     siteName: 'Mon Inclusion Numérique',
//     title: 'Données territoriales - Inclusion Numérique',
//     type: 'website',
//   },
//   robots: {
//     follow: false,
//     index: false,
//   },
//   title: 'Données territoriales - Inclusion Numérique',
// }

export default function DonneesTerritorialesController(): ReactElement {
  return <DonneesTerritoriales />
}
