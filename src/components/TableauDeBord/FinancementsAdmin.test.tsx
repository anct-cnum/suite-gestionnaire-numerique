import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import FinancementsAdmin from './FinancementsAdmin'
import { renderComponent } from '../testHelper'
import { FinancementAdminViewModel } from '@/presenters/tableauDeBord/financementAdminPresenter'

describe('financements admin', () => {
  it('quand le view model est valide alors les deux encarts FNE et Conseiller Numérique sont affichés', () => {
    // GIVEN
    const viewModel = financementAdminViewModelFactory()

    // WHEN
    renderComponent(
      <FinancementsAdmin financementViewModel={viewModel} lienFinancements="/gouvernance/01/beneficiaires" />
    )

    // THEN
    expect(screen.getByText("Financements FNE engagés par l'État")).toBeInTheDocument()
    expect(screen.getByText('Financements Conseiller Numérique versés')).toBeInTheDocument()
    const sousTexteFne = screen.getByText('disponible', { exact: false })
    expect(sousTexteFne.textContent).toBe('sur 5,00 M€ disponible')
    const sousTexteConum = screen.getByText('conventionnés sur les postes liés à la gouvernance', { exact: false })
    expect(sousTexteConum.textContent).toBe('sur 12,00 M€ conventionnés sur les postes liés à la gouvernance')
  })

  it('quand le view model est en erreur alors le message d’erreur est affiché', () => {
    // GIVEN
    const viewModel = {
      message: 'Impossible de récupérer les données de financement admin',
      type: 'error',
    } as const

    // WHEN
    renderComponent(
      <FinancementsAdmin financementViewModel={viewModel} lienFinancements="/gouvernance/01/beneficiaires" />
    )

    // THEN
    expect(screen.getByText('Impossible de récupérer les données de financement admin')).toBeInTheDocument()
  })
})

function financementAdminViewModelFactory(): FinancementAdminViewModel {
  return {
    conseillerNumerique: {
      conventionne: '12,00 M€',
      verse: '9,00 M€',
    },
    fneDisponible: '5,00 M€',
    fneEngage: '3,20 M€',
    nombreDeFinancementsEngagesParLEtat: 7,
    ventilationSubventionsParEnveloppe: [
      {
        color: 'dot-orange-terre-battue-850-200',
        couleurGraphique: '#fcc0b0',
        label: 'Ingénierie France Numérique Ensemble - 2024 - État',
        pourcentageConsomme: 64,
        total: '3,20 M€',
      },
    ],
  }
}
