import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import LieuxInclusionVitrine from './LieuxInclusionVitrine'
import { epochTime } from '@/shared/testHelper'

describe('lieux d’inclusion du site vitrine', () => {
  it('les titres visibles des graphiques et du bloc cartographie sont de vrais titres', () => {
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
      name: 'Lieux en territoires prioritaires',
    })
    expect(titreTerritoiresPrioritaires).toBeInTheDocument()
    const titreLabellises = screen.getByRole('heading', {
      level: 3,
      name: "Lieux labellisés ou habilités Plus d'information sur « Lieux labellisés ou habilités »",
    })
    expect(titreLabellises).toBeInTheDocument()
  })
})
