import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StatistiquesGenerales } from './StatistiquesGenerales'

describe('statistiques générales sur les accompagnements', () => {
  it('l’histogramme est masqué aux aides techniques et doublé d’un tableau de ses données (RGAA 1.6, 7.1)', () => {
    // WHEN
    afficherLesStatistiques()

    // THEN
    expect(screen.queryByRole('application', { hidden: true })).not.toBeInTheDocument()
    const panneauParMois = screen.getByRole('tabpanel', { name: 'Nombre d’accompagnements par mois' })
    expect(
      within(panneauParMois).getByRole('button', { name: 'Afficher les données sous forme de tableau' })
    ).toBeInTheDocument()
    expect(
      within(panneauParMois).getByRole('table', { hidden: true, name: 'Nombre d’accompagnements par mois' })
    ).toBeInTheDocument()
  })

  it('le choix « Par mois » / « Par jour » est un jeu d’onglets DSFR, chaque onglet pilotant son panneau (RGAA 7.1)', () => {
    // WHEN
    afficherLesStatistiques()

    // THEN
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    const listeOnglets = screen.getByRole('tablist', { name: "Affichage des données d'accompagnement" })
    expect(listeOnglets).toHaveClass('fr-tabs__list')
    const ongletParMois = within(listeOnglets).getByRole('tab', { name: 'Par mois', selected: true })
    const ongletParJour = within(listeOnglets).getByRole('tab', { name: 'Par jour', selected: false })
    expect(ongletParMois).toHaveAttribute('tabindex', '0')
    expect(ongletParJour).toHaveAttribute('tabindex', '-1')

    const panneauParMois = screen.getByRole('tabpanel', { name: 'Nombre d’accompagnements par mois' })
    expect(ongletParMois).toHaveAttribute('aria-controls', panneauParMois.id)
    expect(panneauParMois).toHaveAttribute('tabindex', '0')
    expect(panneauParMois).toHaveClass('fr-tabs__panel fr-tabs__panel--selected')

    const panneauParJour = screen.getByRole('tabpanel', { name: 'Nombre d’accompagnements par jour' })
    expect(ongletParJour).toHaveAttribute('aria-controls', panneauParJour.id)
    expect(panneauParJour).toHaveAttribute('tabindex', '0')
    expect(panneauParJour).toHaveClass('fr-tabs__panel')
    expect(panneauParJour).not.toHaveClass('fr-tabs__panel--selected')
  })

  it('le panneau « Par jour » porte le tableau des accompagnements par jour, synchronisé avec son histogramme', () => {
    // WHEN
    afficherLesStatistiques()

    // THEN
    const panneauParJour = screen.getByRole('tabpanel', { name: 'Nombre d’accompagnements par jour' })
    expect(
      within(panneauParJour).getByRole('table', {
        hidden: true,
        name: 'Nombre d’accompagnements par jour, 30 derniers jours de la période',
      })
    ).toBeInTheDocument()
  })

  it('le « i » des accompagnements, nommé sans bulle du navigateur, déplie dans la page leur détail chiffré en liste (RGAA 7.3, #2350)', async () => {
    // GIVEN
    afficherLesStatistiques()
    const bouton = screen.getByRole('button', { name: "Plus d'information à propos des accompagnements" })
    expect(bouton).not.toHaveAttribute('title')
    expect(bouton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(/accompagnements au total dont/)).not.toBeInTheDocument()

    // WHEN
    bouton.focus()
    await userEvent.keyboard('{Enter}')

    // THEN
    expect(bouton).toHaveFocus()
    expect(bouton).toHaveAttribute('aria-expanded', 'true')
    const texte = document.getElementById(bouton.getAttribute('aria-controls') ?? '')
    expect(texte).not.toBeNull()
    const detail = within(texte as HTMLElement)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(detail).toStrictEqual(['2\u202F813 accompagnements individuels', '0 participations lors de 0 ateliers*'])
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
