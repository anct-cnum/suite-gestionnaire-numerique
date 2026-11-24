import { render, screen, within } from '@testing-library/react'
import { Doughnut as ReactDoughnut } from 'react-chartjs-2'
import { describe, expect, it, vi } from 'vitest'

import LieuxInclusionVitrine from './LieuxInclusionVitrine'
import { epochTime } from '@/shared/testHelper'

describe('lieux d’inclusion du site vitrine', () => {
  it('les canvas des demi-anneaux sont des images nommées par leur graphique (RGAA 1.1)', () => {
    // GIVEN
    vi.mocked(ReactDoughnut).mockClear()

    // WHEN
    render(<LieuxInclusionVitrine viewModel={viewModel} />)

    // THEN
    const nomsAccessibles = vi.mocked(ReactDoughnut).mock.calls.map(([props]) => props['aria-label'])
    expect(nomsAccessibles).toStrictEqual([
      'Diagramme en demi-anneau des lieux en territoires prioritaires',
      'Diagramme en demi-anneau des lieux labellisés ou habilités',
    ])
  })

  it('les titres visibles des graphiques, total compris, et du bloc cartographie sont de vrais titres (RGAA 9.1)', () => {
    // WHEN
    render(<LieuxInclusionVitrine viewModel={viewModel} />)

    // THEN
    const titreCartographie = screen.getByRole('heading', { level: 2, name: 'Voir tous les lieux sur la cartographie' })
    expect(titreCartographie).toBeInTheDocument()
    const titreTerritoiresPrioritaires = screen.getByRole('heading', {
      level: 3,
      name: '7 Lieux en territoires prioritaires',
    })
    expect(titreTerritoiresPrioritaires).toBeInTheDocument()
    const titreLabellises = screen.getByRole('heading', {
      level: 3,
      name: '15 Lieux labellisés ou habilités',
    })
    expect(titreLabellises).toBeInTheDocument()
    // RGAA 9.1 (#2350) : le « i » suit le titre sans en faire partie
    expect(within(titreLabellises).queryByRole('button')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: "Plus d'information sur « Lieux labellisés ou habilités »" })
    ).toBeInTheDocument()
  })

  it('n’affiche ni bouton « Exporter » sans action, ni téléchargement du chiffre des lieux : seuls les graphiques se téléchargent, par des liens (RGAA 7.1)', () => {
    // WHEN
    render(
      <LieuxInclusionVitrine
        viewModel={{
          categoryGenerationDate: epochTime,
          lieuxConseillerNumeriques: 10,
          lieuxFranceService: 5,
          nombreLabellisesOuHabilites: 15,
          nombreLieuxInclusion: 100,
          territoriesFRR: 3,
          territoriesPrioritaires: 7,
          territoriesQPV: 4,
        }}
      />
    )

    // THEN
    expect(screen.queryByRole('button', { name: /Exporter/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Exporter/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Télécharger/ })).not.toBeInTheDocument()
    const telechargements = screen
      .getAllByRole('link', { name: /^Télécharger/ })
      .map((lien) => ({ download: lien.getAttribute('download'), intitule: lien.textContent }))
    expect(telechargements).toStrictEqual([
      {
        download: 'Lieux en territoires prioritaires',
        intitule: 'Télécharger le graphique Lieux en territoires prioritaires (PNG)',
      },
      {
        download: 'Lieux labellisés ou habilités',
        intitule: 'Télécharger le graphique Lieux labellisés ou habilités (PNG)',
      },
    ])
  })
})

const viewModel = {
  categoryGenerationDate: epochTime,
  lieuxConseillerNumeriques: 10,
  lieuxFranceService: 5,
  nombreLabellisesOuHabilites: 15,
  nombreLieuxInclusion: 100,
  territoriesFRR: 3,
  territoriesPrioritaires: 7,
  territoriesQPV: 4,
}
