import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import StructureActivites from './StructureActivites'
import { ActivitesStructureViewModel } from '@/presenters/activitesStructurePresenter'

describe('structure activités', () => {
  it('affiche les indicateurs d’activité et le lien vers les statistiques de la structure', () => {
    // GIVEN
    const viewModel = viewModelParDefaut()

    // WHEN
    render(<StructureActivites viewModel={viewModel} />)

    // THEN
    const titre = screen.getByRole('heading', { level: 2, name: 'Activités' })
    expect(titre.textContent).toBe('Activités')
    expect(screen.getByText('120').textContent).toBe('120')
    expect(screen.getByText('Accompagnements de médiation numérique').textContent).toContain(
      'Accompagnements de médiation numérique'
    )
    expect(screen.getByText('18').textContent).toBe('18')
    expect(screen.getByText('Accompagnements Aidants Connect').textContent).toContain('Accompagnements Aidants Connect')
    expect(screen.getByText('68').textContent).toBe('68')
    expect(screen.getByText('48 bénéficiaires suivis').textContent).toBe('48 bénéficiaires suivis')
    expect(screen.getByText(/20 bénéficiaires anonymes/).textContent).toContain('20 bénéficiaires anonymes')
    const lien = screen.getByRole('link', { name: 'Statistiques de la structure' })
    expect(lien).toHaveAttribute('href', '/statistiques?structuresEmployeuses=42')
  })

  it('affiche le graphique par mois par défaut puis bascule sur les 30 derniers jours', async () => {
    // GIVEN
    const viewModel = viewModelParDefaut()
    render(<StructureActivites viewModel={viewModel} />)
    expect(screen.getByText('Les 6 derniers mois').textContent).toBe('Les 6 derniers mois')

    // WHEN
    await userEvent.click(screen.getByRole('radio', { name: 'Par jours' }))

    // THEN
    expect(screen.getByText('Les 30 derniers jours').textContent).toBe('Les 30 derniers jours')
  })
})

function viewModelParDefaut(): ActivitesStructureViewModel {
  return {
    beneficiaires: {
      accompagnes: '68',
      anonymes: '20',
      suivis: '48',
    },
    graphique: {
      parJour: {
        backgroundColor: ['#009099'],
        data: [3],
        labels: ['10/08'],
      },
      parMois: {
        backgroundColor: ['#009099'],
        data: [93],
        labels: ['Avr.'],
      },
    },
    lienStatistiques: '/statistiques?structuresEmployeuses=42',
    totalAidantsConnect: '18',
    totalMediationNumerique: '120',
  }
}
