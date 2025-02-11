import { screen } from '@testing-library/react'

import { renderComponent } from '../testHelper'
import MesFeuillesDeRoute from './MesFeuillesDeRoute'

describe('aperçu des feuilles de route', () => {
  it('quand j’affiche la page des feuilles de route, alors je vois le titre de la page', () => {
    // WHEN
    renderComponent(
      <MesFeuillesDeRoute gouvernanceViewModel={{
        comiteARemplir: {
          commentaire: '',
          date: '',
          derniereEdition: '',
          editeur: '',
          frequences: [],
          types: [],
          uid: 1,
        },
        dateAujourdhui: '',
        departement: '',
        isVide: false,
        sectionCoporteurs: {
          coporteurs: [],
          detailDuNombreDeChaqueMembre: '',
          total: '',
          wording: '',
        },
        sectionFeuillesDeRoute: {
          budgetTotalCumule: '',
          feuillesDeRoute: [],
          lien: {
            label: '',
            url: '',
          },
          total: '1',
          wording: '',
        },
        sectionNoteDeContexte: {
          noteDeContexte: {
            dateDeModification: '',
            nomAuteur: '',
            prenomAuteur: '',
            texteAvecHTML: '',
          },
          sousTitre: '',
        },
        uid: '',
      }}
      />
    )

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Feuilles de route · Rhône' })
    expect(titre).toBeInTheDocument()
    const boutonAjouterUneFeuilleDeRoute = screen.getByRole('button', { name: 'Ajouter une feuille de route' })
    expect(boutonAjouterUneFeuilleDeRoute).toBeInTheDocument()
    const montantTotalDesSubventions = screen.getByText('55 000 €')
    expect(montantTotalDesSubventions).toBeInTheDocument()
    const labelMontantTotalDesSubventions = screen.getByText('Total des subventions de l‘État')
    expect(labelMontantTotalDesSubventions).toBeInTheDocument()
    const montantTotalDesCofinancements = screen.getByText('90 000 €')
    expect(montantTotalDesCofinancements).toBeInTheDocument()
    const labelMontantTotalDesCofinancements = screen.getByText('Total des co-financements')
    expect(labelMontantTotalDesCofinancements).toBeInTheDocument()
    const montantBudgetTotalDesFeuillesDeRoute = screen.getByText('145 000 €')
    expect(montantBudgetTotalDesFeuillesDeRoute).toBeInTheDocument()
    const labelBudgetTotalDesFeuillesDeRoute = screen.getByText('Budget total des feuilles de route')
    expect(labelBudgetTotalDesFeuillesDeRoute).toBeInTheDocument()
  })
})
