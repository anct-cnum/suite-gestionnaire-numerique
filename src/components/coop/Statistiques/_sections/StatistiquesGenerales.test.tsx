import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StatistiquesGenerales } from './StatistiquesGenerales'

describe('statistiques générales sur les accompagnements', () => {
  it('l’histogramme est masqué aux aides techniques et doublé d’un tableau de ses données (RGAA 1.6, 7.1)', () => {
    // WHEN
    afficherLesStatistiques()

    // THEN
    expect(screen.queryByRole('application', { hidden: true })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Afficher les données sous forme de tableau' })).toBeInTheDocument()
    expect(screen.getByRole('table', { hidden: true, name: 'Nombre d’accompagnements par mois' })).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Afficher le nombre d’accompagnements par mois ou par jour' })
    ).toBeInTheDocument()
  })

  it('quand je choisis « Par jour », alors le tableau suit l’histogramme', async () => {
    // GIVEN
    afficherLesStatistiques()

    // WHEN
    await userEvent.click(screen.getByLabelText('Par jour'))

    // THEN
    expect(
      screen.getByRole('table', {
        hidden: true,
        name: 'Nombre d’accompagnements par jour, 30 derniers jours de la période',
      })
    ).toBeInTheDocument()
  })
})

function afficherLesStatistiques(): void {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn<() => void>()
      observe = vi.fn<() => void>()
      unobserve = vi.fn<() => void>()
    }
  )
  render(
    <StatistiquesGenerales
      accompagnementsParJour={[{ count: 3, label: '01/11' }]}
      accompagnementsParMois={[{ count: 2813, label: '11/25' }]}
      tableauAccompagnementsParJour={{
        caption: 'Nombre d’accompagnements par jour, 30 derniers jours de la période',
        enTetes: ['Jour', 'Accompagnements'],
        lignes: [['1er novembre', '3']],
      }}
      tableauAccompagnementsParMois={{
        caption: 'Nombre d’accompagnements par mois',
        enTetes: ['Mois', 'Accompagnements'],
        lignes: [['novembre 2025', '2 813']],
      }}
      totalCounts={{
        accompagnements: {
          collectifs: { proportion: 0, total: 0 },
          individuels: { proportion: 100, total: 2813 },
          total: 2813,
        },
        activites: {
          collectifs: { participants: 0, proportion: 0, total: 0 },
          individuels: { proportion: 100, total: 2813 },
          total: 2813,
        },
        beneficiaires: { anonymes: 0, nouveaux: 0, suivis: 0, total: 0 },
      }}
    />
  )
}
