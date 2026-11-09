import { screen } from '@testing-library/react'
import { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import DispositifsPage from './dispositifs/page'
import LieuxPage from './lieux/page'
import OutilMinPage from './outils-numeriques/min/page'
import OutilsNumeriquesPage from './outils-numeriques/page'
import VitrineHomePage from './page'
import { renderComponent } from '@/components/testHelper'

describe('images de la vitrine (RGAA 1.2)', () => {
  it.each([
    {
      alternativesConservees: [
        'La Coop de la médiation numérique',
        'Cartographie Nationale',
        'Aidants Connect',
        'Conseillers Numériques',
        'MedNum',
        'Data Inclusion',
        'Inégalités numériques',
        "Lieux d'inclusion",
      ],
      intention: 'accueil',
      page: VitrineHomePage,
    },
    {
      alternativesConservees: [
        "Cartographie des lieux d'inclusion numérique",
        'Visualisation des indicateurs territoriaux',
        'Logo Numi Hub Normandie',
        'Logo Cartographie Nationale',
        'Cartographie et mise à jour',
      ],
      intention: 'lieux',
      page: LieuxPage,
    },
    {
      alternativesConservees: ['Illustration Conseiller numérique'],
      intention: 'dispositifs',
      page: DispositifsPage,
    },
    {
      alternativesConservees: [
        "Capture d'écran de Mon Inclusion Numérique",
        "Capture d'écran des visualisations de données",
        "Capture d'écran du pilotage de la feuille de route",
        "Capture d'écran du suivi des dispositifs",
      ],
      intention: 'outil Mon Inclusion Numérique',
      page: OutilMinPage,
    },
    {
      alternativesConservees: [
        "Capture d'écran de Mon inclusion Numérique",
        "Capture d'écran de La Coop de la Médiation",
        "Capture d'écran des bases du numérique d'intérêt général",
        "Capture d'écran de la cartographie des lieux d'inclusion",
        "Capture d'écran d'Aidants Connect",
      ],
      intention: 'outils numériques',
      page: OutilsNumeriquesPage,
    },
  ])(
    'page $intention : seules les images porteuses d’information gardent une alternative, les autres sont ignorées',
    ({ alternativesConservees, page: Page }: CasDePage) => {
      // WHEN
      renderComponent(<Page />)

      // THEN
      const alternatives = screen.getAllByRole('img').map((image) => image.getAttribute('alt'))
      expect(alternatives).toStrictEqual(alternativesConservees)
      screen.getAllByRole('presentation', { hidden: true }).forEach((image) => {
        expect(image.getAttribute('alt')).toBe('')
        expect(image.getAttribute('aria-hidden')).toBe('true')
      })
    }
  )
})

type CasDePage = Readonly<{
  alternativesConservees: ReadonlyArray<string>
  intention: string
  page(): ReactElement
}>
