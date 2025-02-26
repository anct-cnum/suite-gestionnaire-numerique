import { screen, within } from '@testing-library/react'

import { matchWithoutMarkup, presserLeBouton, renderComponent } from '../testHelper'
import { FormulaireAction } from './FormulaireAction'
import { ActionViewModel } from '@/presenters/actionPresenter'
import { actionViewModelFactory } from '@/presenters/testHelper'

describe('ajout des bénéficiaires', () => {
  it('quand il n’y a pas de bénéficiaire alors le bouton ajouter un bénéficiaire s’affiche', () => {
    // WHEN
    afficherLeFormulaireAction({ beneficiaires: [] })

    // THEN
    const bouton = screen.getByRole('button', { name: 'Ajouter' })
    expect(bouton).toBeEnabled()
    expect(bouton).toHaveAttribute('type', 'button')
  })

  describe('quand je clique sur modifier,', () => {
    it('alors le formulaire pour ajouter des bénéficiaires s’affiche', () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      presserLeBouton('Modifier', 'Ajouter des bénéficiaires')

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) bénéficiaire(s)' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterDesBeneficiairesId')
      const titre = screen.getByRole('heading', { level: 1, name: 'Ajouter le(s) bénéficiaire(s)' })
      expect(titre).toBeInTheDocument()
      const sousTitre = screen.getByText(matchWithoutMarkup('Sélectionnez un ou plusieurs bénéficiaires pour cette action. Si vous ne trouvez pas la structure dans cette liste, invitez-la à rejoindre la gouvernance en cliquant ici.'), { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()
      const lien = screen.getByRole('link', { name: 'cliquant ici' })
      expect(lien).toHaveAttribute('href', '/gouvernance/11')

      const fieldset = screen.getByRole('group', { name: 'Les différents bénéficiaires' })

      const membre1 = within(fieldset).getByRole('checkbox', { checked: true, name: 'Rhône (69) Co-porteur' })
      expect(membre1).not.toBeRequired()
      const membre2 = within(fieldset).getByRole('checkbox', { checked: false, name: 'CC des Monts du Lyonnais Co-porteur' })
      expect(membre2).not.toBeRequired()

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
      presserLeBouton('Modifier', 'Ajouter des bénéficiaires')
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) bénéficiaire(s)' })
      const fermer = presserLeBouton('Fermer l’ajout des bénéficiaires')

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterDesBeneficiairesId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je clique sur tout effacer, alors le formulaire se vide', () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      presserLeBouton('Modifier', 'Ajouter des bénéficiaires')
      presserLeBouton('Tout effacer')

      // THEN
      const fieldset = screen.getByRole('group', { name: 'Les différents bénéficiaires' })
      const checkboxes = within(fieldset).getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked()
      })
    })
  })

  function afficherLeFormulaireAction(overrides: Partial<ActionViewModel> = {}): void {
    renderComponent(
      <FormulaireAction
        action={actionViewModelFactory(overrides)}
        label="Ajouter une action"
        validerFormulaire={vi.fn()}
      >
        vide
      </FormulaireAction>
    )
  }
})
