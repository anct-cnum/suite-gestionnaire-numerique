import { within, screen, fireEvent } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { FrozenDate, presserLeBouton, presserLeBoutonRadio, matchWithoutMarkup, renderComponent, stubbedConceal } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('comitologie', () => {
  describe('quand je clique sur ajouter une comitologie,', () => {
    it('le drawer pour ajouter un comité s’affiche', () => {
      // GIVEN
      vi.stubGlobal('Date', FrozenDate)
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourAjouterUnComite()

      // THEN
      const ajouterUnComiteDrawer = screen.getByRole('dialog', { name: 'Ajouter un comité' })
      expect(ajouterUnComiteDrawer).toHaveAttribute('id', 'drawerAjouterComiteId')
      const formulaire = within(ajouterUnComiteDrawer).getByRole('form', { name: 'Ajouter un comité' })
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Ajouter un comité' })
      expect(titre).toBeInTheDocument()
      const sousTitre = within(formulaire).getByText('Renseignez les comités prévus et la fréquence à laquelle ils se réunissent', { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()

      const fieldsets = within(formulaire).getAllByRole('group')
      const typeComiteQuestion = within(fieldsets[0]).getByText(matchWithoutMarkup('Quel type de comité allez-vous organiser ? *'), { selector: 'legend' })
      expect(typeComiteQuestion).toBeInTheDocument()
      const strategique = within(fieldsets[0]).getByRole('radio', { checked: true, name: 'Stratégique' })
      expect(strategique).toHaveAttribute('value', 'strategique')
      const technique = within(fieldsets[0]).getByRole('radio', { checked: false, name: 'Technique' })
      expect(technique).toHaveAttribute('value', 'technique')
      const consultatif = within(fieldsets[0]).getByRole('radio', { checked: false, name: 'Consultatif' })
      expect(consultatif).toHaveAttribute('value', 'consultatif')
      const autre = within(fieldsets[0]).getByRole('radio', { checked: false, name: 'Autre' })
      expect(autre).toHaveAttribute('value', 'autre')

      const frequenceComiteQuestion = within(fieldsets[1]).getByText(matchWithoutMarkup('À quelle fréquence se réunit le comité ? *'), { selector: 'legend' })
      expect(frequenceComiteQuestion).toBeInTheDocument()
      const mensuelle = within(fieldsets[1]).getByRole('radio', { checked: true, name: 'Mensuelle' })
      expect(mensuelle).toHaveAttribute('value', 'mensuelle')
      const trimestrielle = within(fieldsets[1]).getByRole('radio', { checked: false, name: 'Trimestrielle' })
      expect(trimestrielle).toHaveAttribute('value', 'trimestrielle')
      const semestrielle = within(fieldsets[1]).getByRole('radio', { checked: false, name: 'Semestrielle' })
      expect(semestrielle).toHaveAttribute('value', 'semestrielle')
      const annuelle = within(fieldsets[1]).getByRole('radio', { checked: false, name: 'Annuelle' })
      expect(annuelle).toHaveAttribute('value', 'annuelle')

      const date = within(formulaire).getByLabelText('Date du prochain comité')
      expect(date).not.toHaveAttribute('required')
      expect(date).toHaveAttribute('type', 'date')
      expect(date).toHaveAttribute('min', '1996-04-15')

      const commentaire = within(formulaire).getByLabelText('Laissez ici un commentaire général sur le comité', { selector: 'textarea' })
      expect(commentaire).not.toHaveAttribute('required')
      expect(commentaire).toHaveAttribute('maxLength', '500')

      const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).not.toBeDisabled()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourAjouterUnComite()
      const drawer = screen.getByRole('dialog', { name: 'Ajouter un comité' })
      jeFermeLeFormulairePourAjouterUnComite()

      // THEN
      expect(drawer).not.toBeVisible()
    })

    it('puis que je remplis correctement le formulaire, alors le drawer se ferme, une notification s’affiche, la gouvernance est mise à jour et le formulaire est réinitialisé', async () => {
      // GIVEN
      vi.stubGlobal('Date', FrozenDate)
      const ajouterUnComiteAction = vi.fn(async () => Promise.resolve(['OK']))
      vi.stubGlobal('dsfr', stubbedConceal())
      afficherUneGouvernance({ ajouterUnComiteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourAjouterUnComite()
      const ajouterUnComiteDrawer = screen.getByRole('dialog', { name: 'Ajouter un comité' })
      jeSelectionneUnType('Technique')
      jeSelectionneUneFrequence('Annuelle')
      const date = jeChoisisUneDate(ajouterUnComiteDrawer, '1996-04-15')
      const commentaire = jeTapeUnCommentaire(ajouterUnComiteDrawer, 'commentaire')
      const form = screen.getByRole('form', { name: 'Ajouter un comité' })
      const enregistrer = within(form).getByRole('button', { name: 'Enregistrer' })
      fireEvent.click(enregistrer)

      // THEN
      expect(enregistrer).toHaveAccessibleName('Ajout en cours...')
      expect(enregistrer).toBeDisabled()
      const strategique = await screen.findByRole('radio', { checked: true, hidden: true, name: 'Stratégique' })
      expect(strategique).toBeInTheDocument()
      const mensuelle = screen.getByRole('radio', { checked: true, hidden: true, name: 'Mensuelle' })
      expect(mensuelle).toBeInTheDocument()
      expect(date).toHaveValue('')
      expect(commentaire).toHaveValue('')
      expect(ajouterUnComiteDrawer).not.toBeVisible()
      expect(ajouterUnComiteAction).toHaveBeenCalledWith({
        commentaire: 'commentaire',
        date: '1996-04-15',
        frequence: 'annuelle',
        path: '/gouvernance/11',
        type: 'technique',
        uidGouvernance: 'gouvernanceFooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Comité bien ajouté')
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).not.toBeDisabled()
    })

    it('puis que je remplis correctement le formulaire mais qu’une erreur intervient, alors une notification apparaît', async () => {
      // GIVEN
      const ajouterUnComiteAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
      vi.stubGlobal('dsfr', stubbedConceal())
      afficherUneGouvernance({ ajouterUnComiteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourAjouterUnComite()
      const form = screen.getByRole('form', { name: 'Ajouter un comité' })
      const enregistrer = within(form).getByRole('button', { name: 'Enregistrer' })
      fireEvent.click(enregistrer)

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })
  })

  describe('quand je clique sur un comité,', () => {
    it('alors j’affiche le détail du comité', () => {
      // GIVEN
      vi.stubGlobal('Date', FrozenDate)
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourModifierUnComite()

      // THEN
      const detailsDUnComiteDrawer = screen.getByRole('dialog', { name: 'Détail du Comité technique' })
      expect(detailsDUnComiteDrawer).toHaveAttribute('id', 'drawerModifierComiteId')
      const formulaire = within(detailsDUnComiteDrawer).getByRole('form', { name: 'Détail du Comité technique' })
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Détail du Comité technique' })
      expect(titre).toBeInTheDocument()
      const sousTitre = within(formulaire).getByText('Renseignez les comités prévus et la fréquence à laquelle ils se réunissent', { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()

      const fieldsets = within(formulaire).getAllByRole('group')
      const typeComiteQuestion = within(fieldsets[0]).getByText(matchWithoutMarkup('Quel type de comité allez-vous organiser ? *'), { selector: 'legend' })
      expect(typeComiteQuestion).toBeInTheDocument()
      const strategique = within(fieldsets[0]).getByRole('radio', { checked: false, name: 'Stratégique' })
      expect(strategique).toHaveAttribute('value', 'strategique')
      const technique = within(fieldsets[0]).getByRole('radio', { checked: true, name: 'Technique' })
      expect(technique).toHaveAttribute('value', 'technique')
      const consultatif = within(fieldsets[0]).getByRole('radio', { checked: false, name: 'Consultatif' })
      expect(consultatif).toHaveAttribute('value', 'consultatif')
      const autre = within(fieldsets[0]).getByRole('radio', { checked: false, name: 'Autre' })
      expect(autre).toHaveAttribute('value', 'autre')
      const frequenceComiteQuestion = within(fieldsets[1]).getByText(matchWithoutMarkup('À quelle fréquence se réunit le comité ? *'), { selector: 'legend' })
      expect(frequenceComiteQuestion).toBeInTheDocument()
      const mensuelle = within(fieldsets[1]).getByRole('radio', { checked: false, name: 'Mensuelle' })
      expect(mensuelle).toHaveAttribute('value', 'mensuelle')
      const trimestrielle = within(fieldsets[1]).getByRole('radio', { checked: true, name: 'Trimestrielle' })
      expect(trimestrielle).toHaveAttribute('value', 'trimestrielle')
      const semestrielle = within(fieldsets[1]).getByRole('radio', { checked: false, name: 'Semestrielle' })
      expect(semestrielle).toHaveAttribute('value', 'semestrielle')
      const annuelle = within(fieldsets[1]).getByRole('radio', { checked: false, name: 'Annuelle' })
      expect(annuelle).toHaveAttribute('value', 'annuelle')

      const date = within(formulaire).getByLabelText('Date du prochain comité')
      expect(date).not.toHaveAttribute('required')
      expect(date).toHaveAttribute('type', 'date')
      expect(date).toHaveAttribute('min', '1996-04-15')
      expect(date).toHaveValue('2024-03-01')

      const commentaire = within(formulaire).getByLabelText('Laissez ici un commentaire général sur le comité', { selector: 'textarea' })
      expect(commentaire).not.toHaveAttribute('required')
      expect(commentaire).toHaveAttribute('maxLength', '500')
      expect(commentaire).toHaveValue('commentaire')

      const supprimer = within(formulaire).getByRole('button', { name: 'Supprimer' })
      expect(supprimer).not.toBeDisabled()
      const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).not.toBeDisabled()

      const modifierPar = screen.getByText('Modifié le 01/02/2024 par Martin Tartempion')
      expect(modifierPar).toBeInTheDocument()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourModifierUnComite()
      const drawer = screen.getByRole('dialog', { name: 'Détail du Comité technique' })
      jeFermeLeFormulairePourModifierUnComite()

      // THEN
      expect(drawer).not.toBeVisible()
    })
  })

  function jOuvreLeFormulairePourAjouterUnComite(): void {
    presserLeBouton('Ajouter')
  }

  function jeFermeLeFormulairePourAjouterUnComite(): void {
    presserLeBouton('Fermer le formulaire de création d’un comité')
  }

  function jeSelectionneUnType(name: string): void {
    presserLeBoutonRadio(name)
  }

  function jeSelectionneUneFrequence(name: string): void {
    presserLeBoutonRadio(name)
  }

  function jeChoisisUneDate(container: HTMLElement, value: string): HTMLElement {
    const input = within(container).getByLabelText('Date du prochain comité')
    fireEvent.change(input, { target: { value } })
    return input
  }

  function jeTapeUnCommentaire(container: HTMLElement, value: string): HTMLElement {
    const input = within(container).getByLabelText('Laissez ici un commentaire général sur le comité')
    fireEvent.change(input, { target: { value } })
    return input
  }

  function jOuvreLeFormulairePourModifierUnComite(): void {
    presserLeBouton('Comité technique')
  }

  function jeFermeLeFormulairePourModifierUnComite(): void {
    presserLeBouton('Fermer la modification du Comité technique')
  }

  function afficherUneGouvernance(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory(), now)
    renderComponent(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />, options)
  }

  const now = new Date('2024-09-06')
})
