import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import LieuxInclusionVitrine from './LieuxInclusionVitrine'
import { epochTime } from '@/shared/testHelper'

describe('lieux d’inclusion du site vitrine', () => {
  it('les titres visibles des graphiques, total compris, et du bloc cartographie sont de vrais titres (RGAA 9.1)', () => {
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
    const titreCartographie = screen.getByRole('heading', { level: 2, name: 'Voir tous les lieux sur la cartographie' })
    expect(titreCartographie).toBeInTheDocument()
    const titreTerritoiresPrioritaires = screen.getByRole('heading', {
      level: 3,
      name: '7 Lieux en territoires prioritaires',
    })
    expect(titreTerritoiresPrioritaires).toBeInTheDocument()
    const titreLabellises = screen.getByRole('heading', {
      level: 3,
      name: "15 Lieux labellisés ou habilités Plus d'information sur « Lieux labellisés ou habilités »",
    })
    expect(titreLabellises).toBeInTheDocument()
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
