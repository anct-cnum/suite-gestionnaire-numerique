import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { vi } from 'vitest'

import { matchWithoutMarkup, renderComponent } from '../testHelper'
import { FormulaireAction } from './FormulaireAction'
import { ActionViewModel } from '@/presenters/actionPresenter'
import { MembresGouvernancesViewModel } from '@/presenters/membresGouvernancesPresenter'
import { actionViewModelFactory } from '@/presenters/testHelper'

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation')
  return {
    ...actual,
    useParams: () => ({ codeDepartement: '75' }),
  }
})

describe('ajout des bénéficiaires', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      Promise.resolve({
        json: async () =>
          Promise.resolve([
            { nom: 'CC des Monts du Lyonnais Co-porteur', roles: [], uid: 'd0d31e48-812d-48be-b0ce-b2f023a76075' },
            { nom: 'Rhône (69) Co-porteur', roles: [], uid: 'fbcd0003-a87e-4c4b-8512-47b08c8a3832' },
          ]as Array<MembresGouvernancesViewModel>),
      })) as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('quand il n’y a pas de bénéficiaire alors le bouton ajouter un bénéficiaire s’affiche', () => {
    // WHEN
    afficherLeFormulaireAction({ beneficiaires: [] })

    // THEN
    const bouton = screen.getByRole('button', { description: 'Ajouter des bénéficiaires des fonds', name: 'Ajouter' })
    expect(bouton).toBeEnabled()
    expect(bouton).toHaveAttribute('type', 'button')
  })

  describe('quand je clique sur Ajouter,', () => {
    it('alors le formulaire pour ajouter des bénéficiaires s’affiche',async () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      presserLeBouton('Ajouter', 'Ajouter des bénéficiaires des fonds')

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) bénéficiaire(s)' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterDesBeneficiairesId')
      const titre = screen.getByRole('heading', { level: 1, name: 'Ajouter le(s) bénéficiaire(s)' })
      expect(titre).toBeInTheDocument()
      const sousTitre = screen.getByText(matchWithoutMarkup('Sélectionnez un ou plusieurs bénéficiaires des fonds pour cette action. Si vous ne trouvez pas la structure dans cette liste, invitez-la à rejoindre la gouvernance en cliquant ici.'), { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()
      const lien = screen.getByRole('link', { name: 'cliquant ici' })
      expect(lien).toHaveAttribute('href', '/gouvernance/11')

      const fieldset = screen.getByRole('group', { name: 'Les différents bénéficiaires des fonds' })
      await waitFor(() => {
        const membre1 = within(fieldset).getByRole('checkbox', { checked: false, name: 'Rhône (69) Co-porteur' })
        expect(membre1).not.toBeRequired()
        const membre2 = within(fieldset).getByRole('checkbox', { checked: false, name: 'CC des Monts du Lyonnais Co-porteur' })
        expect(membre2).not.toBeRequired()
      })

      const enregistrer = within(fieldset).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toBeEnabled()
      expect(enregistrer).toHaveAttribute('aria-controls', 'drawerAjouterDesBeneficiairesId')
      expect(enregistrer).toHaveAttribute('type', 'button')
      const effacer = within(fieldset).getByRole('button', { name: 'Tout effacer' })
      expect(effacer).toBeEnabled()
      expect(effacer).toHaveAttribute('type', 'button')
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      presserLeBouton('Ajouter', 'Ajouter des bénéficiaires des fonds')
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) bénéficiaire(s)' })
      const fermer = presserLeBouton('Fermer l’ajout des bénéficiaires des fonds')

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterDesBeneficiairesId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je clique sur tout effacer, alors le formulaire se vide', async () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      presserLeBouton('Ajouter', 'Ajouter des bénéficiaires des fonds')
      presserLeBouton('Tout effacer')

      // THEN
      await waitFor(() => {
        const fieldset = screen.getByRole('group', { name: 'Les différents bénéficiaires des fonds' })
        const checkboxes = within(fieldset).getAllByRole('checkbox')
        checkboxes.forEach((checkbox) => {
          expect(checkbox).not.toBeChecked()
        })
      })
    })
  })

  function presserLeBouton(name: string, description?: string): HTMLElement {
    const button = screen.getByRole('button', { description, name })
    fireEvent.click(button)
    return button
  }

  function afficherLeFormulaireAction(overrides: Partial<ActionViewModel> = {}): void {
    renderComponent(
      <FormulaireAction
        action={actionViewModelFactory(overrides)}
        cofinancements={[]}
        drawerId=""
        label="Ajouter une action"
        setIsDrawerOpen={vi.fn<() => void>()}
        supprimerUnCofinancement={vi.fn<() => void>()}
        validerFormulaire={vi.fn<() => Promise<void>>()}
      >
        vide
      </FormulaireAction>
    )
  }
})
