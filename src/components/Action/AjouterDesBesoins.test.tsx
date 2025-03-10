import { fireEvent, screen, within } from '@testing-library/react'

import { renderComponent } from '../testHelper'
import { FormulaireAction } from './FormulaireAction'
import { actionViewModelFactory } from '@/presenters/testHelper'

describe('ajouter des besoins', () => {
  describe('quand je clique sur modifier,', () => {
    it('alors le formulaire pour ajouter des besoins s’affiche', () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      jOuvreLeFormulairePourAjouterDesBesoins()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) besoin(s)' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterDesBesoinsId')
      const titre = screen.getByRole('heading', { level: 1, name: 'Ajouter le(s) besoin(s)' })
      expect(titre).toBeInTheDocument()
      const sousTitre = screen.getByText('Sélectionnez au moins un besoin.', { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()

      const fieldset = screen.getByRole('group', { name: 'Les différents besoins' })

      const fieldsetFormation = within(fieldset).getByRole('group', { name: 'Besoin relatif à la formation des feuilles de route' })
      const diagnostic = within(fieldsetFormation).getByRole('checkbox', { checked: false, name: 'Établir un diagnostic territorial' })
      expect(diagnostic).not.toBeRequired()
      const coconstruire = within(fieldsetFormation).getByRole('checkbox', { checked: true, name: 'Co-construire la feuille de route avec les membres' })
      expect(coconstruire).not.toBeRequired()
      const rediger = within(fieldsetFormation).getByRole('checkbox', { checked: false, name: 'Rédiger la feuille de route' })
      expect(rediger).not.toBeRequired()
      const appuiJuridique = within(fieldsetFormation).getByRole('checkbox', { checked: false, name: 'Appui juridique dédié à la gouvernance' })
      expect(appuiJuridique).not.toBeRequired()

      const fieldsetFinancement = within(fieldset).getByRole('group', { name: 'Besoin relatif au financement du déploiement' })
      const structurerUnFond = within(fieldsetFinancement).getByRole('checkbox', { checked: false, name: 'Structurer un fond local pour l’inclusion numérique' })
      expect(structurerUnFond).not.toBeRequired()
      const monterDossier = within(fieldsetFinancement).getByRole('checkbox', { checked: true, name: 'Monter des dossiers de subvention complexes' })
      expect(monterDossier).not.toBeRequired()
      const animer = within(fieldsetFinancement).getByRole('checkbox', { checked: false, name: 'Animer et mettre en œuvre la gouvernance et la feuille de route' })
      expect(animer).not.toBeRequired()

      const fieldsetOutillage = within(fieldset).getByRole('group', { name: 'Besoin relatif à l’outillage des acteurs' })
      const structurerUneFiliere = within(fieldsetOutillage).getByRole('checkbox', { checked: false, name: 'Structurer une filière de reconditionnement locale' })
      expect(structurerUneFiliere).not.toBeRequired()
      const collecter = within(fieldsetOutillage).getByRole('checkbox', { checked: false, name: 'Collecter des données territoriales pour alimenter un hub national' })
      expect(collecter).not.toBeRequired()
      const sensibiliser = within(fieldsetOutillage).getByRole('checkbox', { checked: false, name: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants' })
      expect(sensibiliser).not.toBeRequired()

      const fieldsetFormationPro = within(fieldset).getByRole('group', { name: 'Besoins relatifs à la formation des professionnels de l’inclusion numérique' })
      const appuyer = within(fieldsetFormationPro).getByRole('checkbox', { checked: false, name: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique' })
      expect(appuyer).not.toBeRequired()

      const enregistrer = within(fieldset).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toBeEnabled()
      expect(enregistrer).toHaveAttribute('aria-controls', 'drawerAjouterDesBesoinsId')
      expect(enregistrer).toHaveAttribute('type', 'button')
      const effacer = within(fieldset).getByRole('button', { name: 'Tout effacer' })
      expect(effacer).toBeEnabled()
      expect(effacer).toHaveAttribute('type', 'button')
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      jOuvreLeFormulairePourAjouterDesBesoins()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter le(s) besoin(s)' })
      const fermer = jeFermeLeFormulairePourAjouterDesBesoins()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterDesBesoinsId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je clique sur tout effacer, alors le formulaire se vide', () => {
      // GIVEN
      afficherLeFormulaireAction()

      // WHEN
      jOuvreLeFormulairePourAjouterDesBesoins()
      jEffaceLeFormulaire()

      // THEN
      const fieldset = screen.getByRole('group', { name: 'Les différents besoins' })
      const checkboxes = within(fieldset).getAllByRole('checkbox')
      checkboxes.forEach((checkbox) => {
        expect(checkbox).not.toBeChecked()
      })
    })
  })

  function jOuvreLeFormulairePourAjouterDesBesoins(): void {
    presserLeBouton('Modifier', 'Ajouter des besoins')
  }

  function jEffaceLeFormulaire(): void {
    presserLeBouton('Tout effacer')
  }

  function jeFermeLeFormulairePourAjouterDesBesoins(): HTMLElement {
    return presserLeBouton('Fermer l’ajout des besoins')
  }

  function presserLeBouton(name: string, description?: string): HTMLElement {
    const button = screen.getByRole('button', { description, name })
    fireEvent.click(button)
    return button
  }

  function afficherLeFormulaireAction(): void {
    renderComponent(
      <FormulaireAction
        action={actionViewModelFactory()}
        cofinancements={[]}
        drawerId="drawerId"
        label="label"
        setIsDrawerOpen={vi.fn<() => void>()}
        supprimerUnCofinancement={vi.fn<() => void>()}
        validerFormulaire={vi.fn<() => Promise<void>>()}
      >
        vide
      </FormulaireAction>
    )
  }
})
