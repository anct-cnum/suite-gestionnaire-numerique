import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Structure from './Structure'
import {
  createDefaultStructureViewModel,
  createStructureViewModelWithMinimalData,
} from '@/stories/Components/Structure/StructureTestData'

describe('structure labellisations', () => {
  // Le sommaire (MenuCollant) observe les sections via IntersectionObserver, absent de jsdom.
  // beforeEach obligatoire : unstubGlobals=true réinitialise les stubs avant chaque test.
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        disconnect(): void {
          // rien à faire en test
        }

        observe(): void {
          // rien à faire en test
        }

        unobserve(): void {
          // rien à faire en test
        }
      }
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('affiche la section et l’entrée de sommaire quand la structure est labellisée et la feature active', () => {
    // GIVEN
    const viewModel = createDefaultStructureViewModel()

    // WHEN
    render(
      <Structure
        activites={null}
        editionNomActive={false}
        labellisationsActives={true}
        peutGererStructure={false}
        rattachements={[]}
        viewModel={viewModel}
      />
    )

    // THEN
    const titre = screen.getByRole('heading', { level: 2, name: 'Habilitation et labellisation de la structure' })
    expect(titre.textContent).toBe('Habilitation et labellisation de la structure')
    expect(screen.getByText('Label conseiller numérique').textContent).toContain('Label conseiller numérique')
    expect(screen.getByText("Jusqu'au 12/12/2026").textContent).toBe("Jusqu'au 12/12/2026")
    expect(screen.getByText('Habilitation Aidants Connect').textContent).toContain('Habilitation Aidants Connect')
    const badgeAidantsConnect = screen.getByText('Actif')
    expect(badgeAidantsConnect.classList.contains('fr-badge--success')).toBe(true)
    const entreeSommaire = screen.getByRole('link', { name: 'Labellisations' })
    expect(entreeSommaire).toHaveAttribute('href', '#labellisation')
  })

  it('affiche la section avec la seule habilitation Aidants Connect quand la structure n’a pas de label conum', () => {
    // GIVEN
    const viewModel = {
      ...createStructureViewModelWithMinimalData(),
      labellisations: {
        estHabiliteeAidantsConnect: true,
        labelConum: undefined,
      },
    }

    // WHEN
    render(
      <Structure
        activites={null}
        editionNomActive={false}
        labellisationsActives={true}
        peutGererStructure={false}
        rattachements={[]}
        viewModel={viewModel}
      />
    )

    // THEN
    const badge = screen.getByText('Actif')
    expect(badge.classList.contains('fr-badge--success')).toBe(true)
    expect(screen.queryByText('Label conseiller numérique')).not.toBeInTheDocument()
    const entreeSommaire = screen.getByRole('link', { name: 'Labellisations' })
    expect(entreeSommaire).toHaveAttribute('href', '#labellisation')
  })

  it('affiche le badge neutre Suspendu quand la dernière attestation est expirée', () => {
    // GIVEN
    const viewModel = {
      ...createDefaultStructureViewModel(),
      labellisations: {
        estHabiliteeAidantsConnect: false,
        labelConum: {
          estActif: false,
          statut: 'Suspendu',
        },
      },
    }

    // WHEN
    render(
      <Structure
        activites={null}
        editionNomActive={false}
        labellisationsActives={true}
        peutGererStructure={false}
        rattachements={[]}
        viewModel={viewModel}
      />
    )

    // THEN
    const badge = screen.getByText('Suspendu')
    expect(badge.textContent).toBe('Suspendu')
    expect(badge.classList.contains('fr-badge--success')).toBe(false)
  })

  it('n’affiche ni la section ni l’entrée de sommaire quand la structure n’est pas labellisée', () => {
    // GIVEN
    const viewModel = createStructureViewModelWithMinimalData()

    // WHEN
    render(
      <Structure
        activites={null}
        editionNomActive={false}
        labellisationsActives={true}
        peutGererStructure={false}
        rattachements={[]}
        viewModel={viewModel}
      />
    )

    // THEN
    expect(
      screen.queryByRole('heading', { level: 2, name: 'Habilitation et labellisation de la structure' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Labellisations' })).not.toBeInTheDocument()
  })

  it('n’affiche ni la section ni l’entrée de sommaire quand la feature est inactive', () => {
    // GIVEN
    const viewModel = createDefaultStructureViewModel()

    // WHEN
    render(
      <Structure
        activites={null}
        editionNomActive={false}
        labellisationsActives={false}
        peutGererStructure={false}
        rattachements={[]}
        viewModel={viewModel}
      />
    )

    // THEN
    expect(
      screen.queryByRole('heading', { level: 2, name: 'Habilitation et labellisation de la structure' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Labellisations' })).not.toBeInTheDocument()
  })
})
