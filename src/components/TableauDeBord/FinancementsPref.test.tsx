import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import FinancementsPref from './FinancementsPref'
import { renderComponent } from '../testHelper'
import { FinancementViewModel } from '@/presenters/tableauDeBord/financementPrefPresenter'

describe('financements pref', () => {
  it('quand le view model est valide alors les deux encarts FNE et Conseiller Numérique sont affichés', () => {
    // GIVEN
    const viewModel = financementViewModelFactory()

    // WHEN
    renderComponent(<FinancementsPref conventionnement={viewModel} lienFinancements="/gouvernance/69/financements" />)

    // THEN
    expect(screen.getByText("Financements FNE engagés par l'État")).toBeInTheDocument()
    expect(screen.getByText('Financements Conseiller Numérique versés')).toBeInTheDocument()
    const sousTexteFne = screen.getByText('de votre budget global renseigné', { exact: false })
    expect(sousTexteFne.textContent).toBe('sur 1 500 000 € de votre budget global renseigné')
    const sousTexteConum = screen.getByText('conventionnés sur les postes liés à la gouvernance', { exact: false })
    expect(sousTexteConum.textContent).toBe('sur 800 000 € conventionnés sur les postes liés à la gouvernance')
  })

  it('quand le view model est en erreur alors le message d’erreur est affiché', () => {
    // GIVEN
    const viewModel = {
      message: 'Impossible de récupérer les données de financement',
      type: 'error',
    } as const

    // WHEN
    renderComponent(<FinancementsPref conventionnement={viewModel} lienFinancements="/gouvernance/69/financements" />)

    // THEN
    expect(screen.getByText('Impossible de récupérer les données de financement')).toBeInTheDocument()
  })
})

function financementViewModelFactory(): FinancementViewModel {
  return {
    budgetGlobalRenseigne: '1 500 000 €',
    conseillerNumerique: {
      conventionne: '800 000 €',
      verse: '600 000 €',
    },
    fneEngage: '450 000 €',
    nombreDeFinancementsEngagesParLEtat: 3,
    ventilationSubventionsParEnveloppe: [
      {
        color: '#000091',
        label: 'Ingénierie France Numérique Ensemble - 2024 - État',
        pourcentageConsomme: 45,
        total: '450 000 €',
      },
    ],
  }
}
