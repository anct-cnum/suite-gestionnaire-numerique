import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatistiquesActivites } from './StatistiquesActivites'
import { ActivitesStats } from '../types'

describe('statistiques sur les accompagnements', () => {
  it('les thématiques sont un jeu d’onglets DSFR, chaque onglet pilotant son panneau (RGAA 7.1)', () => {
    // WHEN
    afficherLesActivites({ tags: [] })

    // THEN
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    const listeOnglets = screen.getByRole('tablist', { name: 'Affichage des thématiques des accompagnements' })
    expect(listeOnglets).toHaveClass('fr-tabs__list')
    const onglets = within(listeOnglets).getAllByRole('tab')
    expect(onglets.map((onglet) => onglet.textContent?.trim())).toStrictEqual([
      'Médiation numérique',
      'Démarches administratives',
      'Tags spécifiques',
    ])
    expect(onglets.map((onglet) => onglet.getAttribute('aria-selected'))).toStrictEqual(['true', 'false', 'false'])
    expect(onglets.map((onglet) => onglet.getAttribute('tabindex'))).toStrictEqual(['0', '-1', '-1'])

    const panneaux = screen.getAllByRole('tabpanel')
    expect(panneaux.map((panneau) => panneau.getAttribute('aria-label'))).toStrictEqual([
      'Thématiques des accompagnements de médiation numérique',
      'Thématiques des accompagnements de démarches administratives',
      'Tags spécifiques',
    ])
    panneaux.forEach((panneau, index) => {
      expect(onglets[index]).toHaveAttribute('aria-controls', panneau.id)
      expect(panneau).toHaveAttribute('tabindex', '0')
    })
    expect(panneaux[0]).toHaveClass('fr-tabs__panel fr-tabs__panel--selected')
    expect(panneaux[1]).not.toHaveClass('fr-tabs__panel--selected')
    expect(panneaux[2]).not.toHaveClass('fr-tabs__panel--selected')
  })

  it('sans tags (vue France), l’onglet « Tags spécifiques » et son panneau ne sont pas rendus', () => {
    // WHEN
    afficherLesActivites({ tags: undefined })

    // THEN
    expect(screen.getAllByRole('tab').map((onglet) => onglet.textContent?.trim())).toStrictEqual([
      'Médiation numérique',
      'Démarches administratives',
    ])
    expect(screen.getAllByRole('tabpanel')).toHaveLength(2)
  })
})

function afficherLesActivites({ tags }: Readonly<{ tags: ActivitesStats['tags'] }>): void {
  render(
    <StatistiquesActivites
      activites={{
        durees: [],
        materiels: [],
        tags,
        thematiques: [],
        thematiquesDemarches: [],
        total: 0,
        typeActivites: [],
        typeLieu: [],
      }}
      totalCounts={{
        accompagnements: {
          collectifs: { proportion: 0, total: 0 },
          individuels: { proportion: 0, total: 0 },
          total: 0,
        },
        activites: {
          collectifs: { participants: 0, proportion: 0, total: 0 },
          individuels: { proportion: 0, total: 0 },
          total: 0,
        },
        beneficiaires: { anonymes: 0, nouveaux: 0, suivis: 0, total: 0 },
      }}
    />
  )
}
