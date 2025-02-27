import { screen, within } from '@testing-library/react'

import { matchWithoutMarkup, presserLeBouton, renderComponent } from '../testHelper'
import { FormulaireAction } from './FormulaireAction'
import { ActionViewModel } from '@/presenters/actionPresenter'
import { actionViewModelFactory } from '@/presenters/testHelper'

describe('ajout des porteurs', () => {
  it('quand il n’y a pas de porteur alors le bouton ajouter un porteur s’affiche', () => {
    // WHEN
    afficherLeFormulaireAction({ porteurs: [] })

    // THEN
    const bouton = screen.getByRole('button', { name: 'Ajouter' })
    expect(bouton).toBeEnabled()
    expect(bouton).toHaveAttribute('type', 'button')
  })

  describe('quand je clique sur modifier,', () => {
    it('alors le formulaire pour ajouter des porteurs s’affiche', () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      presserLeBouton('Modifier', 'Ajouter des porteurs')

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) porteur(s)' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterDesPorteursId')
      const titre = screen.getByRole('heading', { level: 1, name: 'Ajouter le(s) porteur(s)' })
      expect(titre).toBeInTheDocument()
      const sousTitre = screen.getByText(matchWithoutMarkup('Sélectionnez un ou plusieurs porteurs pour cette action. Si vous ne trouvez pas la structure dans cette liste, invitez-la à rejoindre la gouvernance en cliquant ici.'), { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()
      const lien = screen.getByRole('link', { name: 'cliquant ici' })
      expect(lien).toHaveAttribute('href', '/gouvernance/11')

      const fieldset = screen.getByRole('group', { name: 'Les différents porteurs' })

      const membre1 = within(fieldset).getByRole('checkbox', { checked: false, name: 'Rhône (69) Co-porteur' })
      expect(membre1).not.toBeRequired()
      const membre2 = within(fieldset).getByRole('checkbox', { checked: true, name: 'CC des Monts du Lyonnais Co-porteur' })
      expect(membre2).not.toBeRequired()

      const enregistrer = within(fieldset).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toBeEnabled()
      expect(enregistrer).toHaveAttribute('aria-controls', 'drawerAjouterDesPorteursId')
      expect(enregistrer).toHaveAttribute('type', 'button')
      const effacer = within(fieldset).getByRole('button', { name: 'Tout effacer' })
      expect(effacer).toBeEnabled()
      expect(effacer).toHaveAttribute('type', 'button')
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      presserLeBouton('Modifier', 'Ajouter des porteurs')
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) porteur(s)' })
      const fermer = presserLeBouton('Fermer l’ajout des porteurs')

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterDesPorteursId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je clique sur tout effacer, alors le formulaire se vide', () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      presserLeBouton('Modifier', 'Ajouter des porteurs')
      presserLeBouton('Tout effacer')

      // THEN
      const fieldset = screen.getByRole('group', { name: 'Les différents porteurs' })
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
        cofinancements={[]}
        drawerId=""
        label="Ajouter une action"
        setIsDrawerOpen={vi.fn()}
        supprimerUnCofinancement={vi.fn()}
        validerFormulaire={vi.fn()}
      >
        vide
      </FormulaireAction>
    )
  }
})
