import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Financements from './Financements'
import { renderComponent } from '../testHelper'
import { FinancementsViewModel } from '@/presenters/tableauDeBord/financementsPresenter'

describe('financements', () => {
  it('quand la vue est détaillée alors les deux encarts FNE et Conseiller Numérique sont affichés avec leurs sous-lignes', () => {
    // GIVEN
    const viewModel = vueDetailleeFactory()

    // WHEN
    renderComponent(
      <Financements
        lienFinancements={{ href: '/gouvernance/01/beneficiaires', libelle: 'Les demandes' }}
        porteeVide="pour la France"
        sousTitre="Chiffres clés des enveloppes de financement"
        viewModel={viewModel}
      />
    )

    // THEN
    expect(screen.getByText("Financements FNE engagés par l'État")).toBeInTheDocument()
    expect(screen.getByText('Financements Conseiller Numérique versés')).toBeInTheDocument()
    const sousTexteFne = screen.getByText('disponible', { exact: false })
    expect(sousTexteFne.textContent).toBe('sur 5,00 M€ disponible')
    const sousTexteConum = screen.getByText('conventionnés sur les postes liés à la gouvernance', { exact: false })
    expect(sousTexteConum.textContent).toBe('sur 12,00 M€ conventionnés sur les postes liés à la gouvernance')
    const lien = screen.getByRole('link', { name: 'Les demandes' })
    expect(lien).toHaveAttribute('href', '/gouvernance/01/beneficiaires')
  })

  it("quand la vue est détaillée sans référence FNE alors la sous-ligne du chiffre FNE n'est pas affichée", () => {
    // GIVEN
    const viewModel = vueDetailleeFactory({
      conseillerNumerique: {
        complementConventionne: 'conventionnés sur les postes de la structure',
        conventionne: '127 999 €',
        verse: '99 999 €',
      },
      fne: { engage: '35 100 €', reference: undefined },
    })

    // WHEN
    renderComponent(
      <Financements
        porteeVide="pour la structure"
        sousTitre="Chiffres clés de vos financements"
        viewModel={viewModel}
      />
    )

    // THEN
    expect(screen.queryByText('disponible', { exact: false })).not.toBeInTheDocument()
    const sousTexteConum = screen.getByText('conventionnés sur les postes de la structure', { exact: false })
    expect(sousTexteConum.textContent).toBe('sur 127 999 € conventionnés sur les postes de la structure')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('quand la vue est simple alors le donut du total et la liste des enveloppes sont affichés', () => {
    // GIVEN
    const viewModel: FinancementsViewModel = {
      totalFinancements: '87 500 €',
      ventilation: [
        {
          color: 'dot-purple-glycine-main-494',
          couleurGraphique: '#a558a0',
          label: 'Conseiller Numérique - Plan France Relance - État',
          montant: 50000,
          total: '50 000 €',
        },
        {
          color: 'dot-green-tilleul-verveine-925',
          couleurGraphique: '#fbe769',
          label: 'Conseiller Numérique - Renouvellement - État',
          montant: 37500,
          total: '37 500 €',
        },
      ],
      vue: 'simple',
    }

    // WHEN
    renderComponent(
      <Financements
        lienFinancements={{ href: '/structures/8791/financements', libelle: 'Les demandes en cours' }}
        porteeVide="pour la structure"
        sousTitre="Chiffres clés de vos financements"
        viewModel={viewModel}
      />
    )

    // THEN
    expect(screen.getByText('87 500 €')).toBeInTheDocument()
    expect(screen.getByText("Financements engagés par l'État")).toBeInTheDocument()
    expect(screen.getByText('Dont')).toBeInTheDocument()
    expect(screen.getByText('Conseiller Numérique - Plan France Relance - État', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('50 000 €')).toBeInTheDocument()
  })

  it("quand la vue est vide alors l'état vide est affiché avec la portée", () => {
    // WHEN
    renderComponent(
      <Financements
        porteeVide="pour le département"
        sousTitre="Chiffres clés des budgets et financements"
        viewModel={{ vue: 'vide' }}
      />
    )

    // THEN
    const etatVide = screen.getByText('👻 Aucun financement trouvé')
    expect(etatVide.parentElement?.textContent).toBe('👻 Aucun financement trouvé pour le département')
  })

  it("quand le view model est en erreur alors le message d'erreur est affiché", () => {
    // WHEN
    renderComponent(
      <Financements
        porteeVide="pour la structure"
        sousTitre="Chiffres clés de vos financements"
        viewModel={{ message: 'Impossible de récupérer les données de financement', type: 'error' }}
      />
    )

    // THEN
    expect(screen.getByText('Impossible de récupérer les données de financement')).toBeInTheDocument()
  })
})

function vueDetailleeFactory(
  surcharge?: Partial<Extract<FinancementsViewModel, { vue: 'detaillee' }>>
): FinancementsViewModel {
  return {
    conseillerNumerique: {
      complementConventionne: 'conventionnés sur les postes liés à la gouvernance',
      conventionne: '12,00 M€',
      verse: '9,00 M€',
    },
    enveloppesConseillerNumerique: [],
    fne: {
      engage: '3,20 M€',
      reference: { libelle: 'disponible', montant: '5,00 M€' },
    },
    jauges: true,
    nombreDeFinancementsEngagesParLEtat: 7,
    noteMethodologique: 'Nombre de demandes de subventions validées des feuilles de route.',
    ventilationFne: [
      {
        color: 'dot-orange-terre-battue-850-200',
        couleurGraphique: '#fcc0b0',
        label: 'Ingénierie France Numérique Ensemble - 2024 - État',
        pourcentageConsomme: 64,
        total: '3,20 M€',
      },
    ],
    vue: 'detaillee',
    ...surcharge,
  }
}
