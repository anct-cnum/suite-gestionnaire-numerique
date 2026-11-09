import { screen } from '@testing-library/react'
import { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import AccessibilitePage from './accessibilite/page'
import DispositifsPage from './dispositifs/page'
import LieuxPage from './lieux/page'
import OutilMinPage from './outils-numeriques/min/page'
import OutilsNumeriquesPage from './outils-numeriques/page'
import VitrineHomePage from './page'
import { renderComponent } from '@/components/testHelper'
import ResumeFeuilleDeRouteVitrine from '@/components/vitrine/FeuilleDeRoute/ResumeFeuilleDeRouteVitrine'
import LieuxInclusionVitrine from '@/components/vitrine/LieuxInclusion/LieuxInclusionVitrine'
import SectionCartographie from '@/components/vitrine/SyntheseEtIndicateurs/SectionCartographie'
import { epochTime } from '@/shared/testHelper'

const intitulesGeneriques = [
  'En savoir plus',
  'Voir la ressource',
  'Voir la cartographie',
  'La cartographie',
  'Ouvrir le pdf',
  'Se connecter',
]

function LieuxInclusion(): ReactElement {
  return (
    <LieuxInclusionVitrine
      viewModel={{
        categoryGenerationDate: epochTime,
        lieuxConseillerNumeriques: 1,
        lieuxFranceService: 1,
        nombreLabellisesOuHabilites: 1,
        nombreLieuxInclusion: 1,
        territoriesFRR: 1,
        territoriesPrioritaires: 1,
        territoriesQPV: 1,
      }}
    />
  )
}

describe('liens de la vitrine (RGAA 6.1 et 13.2)', () => {
  it.each([
    { intention: 'accueil', page: VitrineHomePage },
    { intention: 'lieux', page: LieuxPage },
    { intention: 'dispositifs', page: DispositifsPage },
    { intention: 'outils numériques', page: OutilsNumeriquesPage },
    { intention: 'outil Mon Inclusion Numérique', page: OutilMinPage },
    { intention: 'déclaration d’accessibilité', page: AccessibilitePage },
    { intention: 'lieux d’inclusion des données territoriales', page: LieuxInclusion },
    { intention: 'synthèse des données territoriales', page: SectionCartographie },
  ])(
    'page $intention : chaque lien ouvrant une nouvelle fenêtre le signale dans un title qui reprend son intitulé',
    ({ page: Page }: CasDePage) => {
      // WHEN
      renderComponent(<Page />)

      // THEN
      const liensNouvelleFenetre = screen
        .getAllByRole('link')
        .filter((lien) => lien.getAttribute('target') === '_blank')
      expect(liensNouvelleFenetre.length).toBeGreaterThan(0)
      liensNouvelleFenetre.forEach((lien) => {
        expect(lien.getAttribute('title')).toBe(`${lien.textContent.trim()} - nouvelle fenêtre`)
      })
    }
  )

  it.each([
    { intention: 'accueil', page: VitrineHomePage },
    { intention: 'lieux', page: LieuxPage },
    { intention: 'dispositifs', page: DispositifsPage },
    { intention: 'outils numériques', page: OutilsNumeriquesPage },
    { intention: 'outil Mon Inclusion Numérique', page: OutilMinPage },
    { intention: 'lieux d’inclusion des données territoriales', page: LieuxInclusion },
    { intention: 'synthèse des données territoriales', page: SectionCartographie },
  ])('page $intention : aucun lien ne porte un intitulé générique', ({ page: Page }: CasDePage) => {
    // WHEN
    renderComponent(<Page />)

    // THEN
    const intitules = screen.getAllByRole('link').map((lien) => lien.textContent.trim())
    intitulesGeneriques.forEach((intituleGenerique) => {
      expect(intitules).not.toContain(intituleGenerique)
    })
  })

  it('page outils numériques : chaque outil a un lien explicite, celui de Mon Inclusion Numérique reste dans l’onglet', () => {
    // WHEN
    renderComponent(<OutilsNumeriquesPage />)

    // THEN
    const lienMin = screen.getByRole('link', { name: 'Découvrir Mon Inclusion Numérique' })
    expect(lienMin.getAttribute('href')).toBe('/vitrine/outils-numeriques/min')
    expect(lienMin.getAttribute('target')).toBeNull()
    expect(screen.getByRole('link', { name: 'Découvrir La Coop de la médiation numérique' }).getAttribute('href')).toBe(
      'https://coop-numerique.anct.gouv.fr/'
    )
    expect(
      screen.getByRole('link', { name: "Découvrir Les Bases du numérique d'intérêt général" }).getAttribute('href')
    ).toBe('https://lesbases.anct.gouv.fr/')
    expect(
      screen
        .getByRole('link', { name: "Découvrir la cartographie des lieux d'inclusion numérique" })
        .getAttribute('href')
    ).toBe('https://cartographie.societenumerique.gouv.fr')
    expect(screen.getByRole('link', { name: 'Découvrir Aidants Connect' }).getAttribute('href')).toBe(
      'https://aidantsconnect.beta.gouv.fr/'
    )
  })

  it('feuille de route : le lien du PDF nomme la feuille de route et signale la nouvelle fenêtre', () => {
    // WHEN
    renderComponent(
      <ResumeFeuilleDeRouteVitrine
        feuilleDeRoute={{
          actions: [],
          links: { ajouter: '/ajouter', detail: '/detail' },
          nom: 'Feuille de route inclusion numérique du Rhône',
          nombreDActionsAttachees: '0 action attachée à cette feuille de route',
          pieceJointe: {
            href: '/fichier/feuille-de-route.pdf',
            metadonnee: 'Le 01/01/1970.',
            nom: 'feuille-de-route.pdf',
          },
          totaux: { budget: '0 €', coFinancement: '0 €', financementAccorde: '0 €' },
          uid: 'feuilleDeRouteFooId',
          wordingDetailDuBudget: '',
          wordingNombreCofinanceursEtBeneficiaires: '',
        }}
      />
    )

    // THEN
    const lien = screen.getByRole('link', { name: 'Ouvrir « Feuille de route inclusion numérique du Rhône » (PDF)' })
    expect(lien.getAttribute('href')).toBe('/fichier/feuille-de-route.pdf')
    expect(lien.getAttribute('target')).toBe('_blank')
    expect(lien.getAttribute('title')).toBe(
      'Ouvrir « Feuille de route inclusion numérique du Rhône » (PDF) - nouvelle fenêtre'
    )
  })
})

type CasDePage = Readonly<{
  intention: string
  page(): ReactElement
}>
