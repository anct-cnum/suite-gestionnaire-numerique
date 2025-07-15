import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Gouvernance from '../Gouvernance'
import { matchWithoutMarkup, renderComponent, stubbedServerAction } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { epochTimePlusOneDay } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('comitologie', () => {
  describe('quand je clique sur ajouter une comitologie,', () => {
    it('alors le drawer pour ajouter un comité s’affiche', () => {
      // GIVEN
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourAjouterUnComite()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un comité' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterComiteId')
      const formulaire = within(drawer).getByRole('form', { name: 'Ajouter un comité' })
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
      expect(date).not.toBeRequired()
      expect(date).toHaveAttribute('type', 'date')
      expect(date).toHaveAttribute('min', '1970-01-02')

      const commentaire = within(formulaire).getByRole('textbox', { name: 'Description' })
      expect(commentaire).not.toBeRequired()
      expect(commentaire).toHaveAttribute('maxLength', '500')

      const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toHaveAttribute('aria-controls', 'drawerAjouterComiteId')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourAjouterUnComite()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un comité' })
      const fermer = jeFermeLeFormulairePourAjouterUnComite()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterComiteId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je remplis correctement le formulaire, alors le drawer se ferme, une notification s’affiche, la gouvernance est mise à jour et le formulaire est réinitialisé', async () => {
      // GIVEN
      const ajouterUnComiteAction = stubbedServerAction(['OK'])
      afficherUneGouvernance({ ajouterUnComiteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourAjouterUnComite()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un comité' })
      jeSelectionneUnType('Technique')
      jeSelectionneUneFrequence('Annuelle')
      const date = jeChoisisUneDate(drawer, '1970-01-02')
      const commentaire = jeTapeUnCommentaire(drawer, 'commentaire')
      const enregistrer = jEnregistreLeComite()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Ajout en cours...')
      expect(enregistrer).toBeDisabled()
      const strategique = await screen.findByRole('radio', { checked: true, hidden: true, name: 'Stratégique' })
      expect(strategique).toBeInTheDocument()
      const mensuelle = screen.getByRole('radio', { checked: true, hidden: true, name: 'Mensuelle' })
      expect(mensuelle).toBeInTheDocument()
      expect(date).toHaveValue('')
      expect(commentaire).toHaveValue('')
      expect(drawer).not.toBeVisible()
      expect(ajouterUnComiteAction).toHaveBeenCalledWith({
        commentaire: 'commentaire',
        date: '1970-01-02',
        frequence: 'annuelle',
        path: '/gouvernance/11',
        type: 'technique',
        uidGouvernance: 'gouvernanceFooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Comité ajouté')
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je ne remplis pas la date et le commentaire qui sont facultatifs, alors la gouvernance est mise à jour', async () => {
      // GIVEN
      const ajouterUnComiteAction = stubbedServerAction(['OK'])
      afficherUneGouvernance({ ajouterUnComiteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourAjouterUnComite()
      jEnregistreLeComite()

      // THEN
      await waitFor(() => {
        expect(ajouterUnComiteAction).toHaveBeenCalledWith({
          commentaire: '',
          date: undefined,
          frequence: 'mensuelle',
          path: '/gouvernance/11',
          type: 'strategique',
          uidGouvernance: 'gouvernanceFooId',
        })
      })
    })

    it('puis que je remplis correctement le formulaire mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const ajouterUnComiteAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      afficherUneGouvernance({ ajouterUnComiteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourAjouterUnComite()
      jEnregistreLeComite()
      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })

    function jEnregistreLeComite(): HTMLElement {
      const form = screen.getByRole('form', { name: 'Ajouter un comité' })
      const enregistrer = within(form).getByRole('button', { name: 'Enregistrer' })
      fireEvent.click(enregistrer)
      return enregistrer
    }
  })

  describe('quand je clique sur un comité,', () => {
    it('alors le drawer des détails du comité s’affiche', () => {
      // GIVEN
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourModifierUnComite()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Détail du Comité technique' })
      expect(drawer).toHaveAttribute('id', 'drawerModifierComiteId')
      const formulaire = within(drawer).getByRole('form', { name: 'Détail du Comité technique' })
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
      expect(date).not.toBeRequired()
      expect(date).toHaveAttribute('type', 'date')
      expect(date).toHaveAttribute('min', '1970-01-02')
      expect(date).toHaveValue('1970-01-01')

      const commentaire = within(formulaire).getByRole('textbox', { name: 'Description' })
      expect(commentaire).not.toBeRequired()
      expect(commentaire).toHaveAttribute('maxLength', '500')
      expect(commentaire).toHaveValue('commentaire')

      const supprimer = within(formulaire).getByRole('button', { name: 'Supprimer' })
      expect(supprimer).toHaveAttribute('aria-controls', 'drawerModifierComiteId')
      expect(supprimer).toHaveAttribute('type', 'button')
      expect(supprimer).toBeEnabled()
      const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toHaveAttribute('aria-controls', 'drawerModifierComiteId')
      expect(enregistrer).toHaveAttribute('type', 'submit')
      expect(enregistrer).toBeEnabled()

      const modifierPar = screen.getByText('Modifié le 31/12/1969 par Martin Tartempion')
      expect(modifierPar).toBeInTheDocument()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourModifierUnComite()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Détail du Comité technique' })
      const fermer = jeFermeLeFormulairePourModifierUnComite()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerModifierComiteId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je le modifie et que je l’enregistre, alors le drawer se ferme, une notification s’affiche et la gouvernance est mise à jour', async () => {
      // GIVEN
      const modifierUnComiteAction = stubbedServerAction(['OK'])
      afficherUneGouvernance({ modifierUnComiteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourModifierUnComite()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Détail du Comité technique' })
      jeSelectionneUnType('Technique')
      jeSelectionneUneFrequence('Trimestrielle')
      jeChoisisUneDate(drawer, '2990-04-15')
      jeTapeUnCommentaire(drawer, 'un nouveau commentaire')
      const enregistrer = jEnregistreLeComite()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Modification en cours...')
      expect(enregistrer).toBeDisabled()
      expect(modifierUnComiteAction).toHaveBeenCalledWith({
        commentaire: 'un nouveau commentaire',
        date: '2990-04-15',
        frequence: 'trimestrielle',
        path: '/gouvernance/11',
        type: 'technique',
        uid: '2',
        uidGouvernance: 'gouvernanceFooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Comité modifié')
      expect(drawer).not.toBeVisible()
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je modifie sans remplir la date et le commentaire qui sont facultatifs, alors la gouvernance est mise à jour', async () => {
      // GIVEN
      const modifierUnComiteAction = stubbedServerAction(['OK'])
      afficherUneGouvernance({ modifierUnComiteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourModifierUnComite()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Détail du Comité technique' })
      jeChoisisUneDate(drawer, '')
      jeTapeUnCommentaire(drawer, '')
      jEnregistreLeComite()

      // THEN
      await waitFor(() => {
        expect(modifierUnComiteAction).toHaveBeenCalledWith({
          commentaire: '',
          date: undefined,
          frequence: 'trimestrielle',
          path: '/gouvernance/11',
          type: 'technique',
          uid: '2',
          uidGouvernance: 'gouvernanceFooId',
        })
      })
    })

    it('puis que je le modifie mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const modifierUnComiteAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      afficherUneGouvernance({ modifierUnComiteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourModifierUnComite()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Détail du Comité technique' })
      jeChoisisUneDate(drawer, epochTimePlusOneDay.toISOString())
      jEnregistreLeComite()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })

    it('puis que je le supprime, alors le drawer se ferme, une notification s’affiche et la gouvernance est mise à jour', async () => {
      // GIVEN
      const supprimerUnComiteAction = stubbedServerAction(['OK'])
      afficherUneGouvernance({ pathname: '/gouvernance/11', supprimerUnComiteAction })

      // WHEN
      jOuvreLeFormulairePourModifierUnComite()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Détail du Comité technique' })
      const supprimer = jeSupprimeLeComite()

      // THEN
      expect(supprimer).toHaveAccessibleName('Suppression en cours...')
      expect(supprimer).toBeDisabled()
      expect(supprimerUnComiteAction).toHaveBeenCalledWith({
        path: '/gouvernance/11',
        uid: '2',
        uidGouvernance: 'gouvernanceFooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Comité supprimé')
      expect(drawer).not.toBeVisible()
      expect(supprimer).toHaveAccessibleName('Supprimer')
      expect(supprimer).toBeEnabled()
    })

    it('puis que je le supprime mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const supprimerUnComiteAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      afficherUneGouvernance({ pathname: '/gouvernance/11', supprimerUnComiteAction })

      // WHEN
      jOuvreLeFormulairePourModifierUnComite()
      jeSupprimeLeComite()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })

    function jEnregistreLeComite(): HTMLElement {
      const form = screen.getByRole('form', { name: 'Détail du Comité technique' })
      const enregistrer = within(form).getByRole('button', { name: 'Enregistrer' })
      fireEvent.click(enregistrer)
      return enregistrer
    }

    function jeSupprimeLeComite(): HTMLElement {
      return presserLeBouton('Supprimer')
    }
  })

  function jOuvreLeFormulairePourAjouterUnComite(): void {
    presserLeBouton('Ajouter')
  }

  function jeFermeLeFormulairePourAjouterUnComite(): HTMLElement {
    return presserLeBouton('Fermer le formulaire de création d’un comité')
  }

  function jeSelectionneUnType(name: string): void {
    fireEvent.click(screen.getByRole('radio', { name }))
  }

  function jeSelectionneUneFrequence(name: string): void {
    fireEvent.click(screen.getByRole('radio', { name }))
  }

  function jeChoisisUneDate(container: HTMLElement, value: string): HTMLElement {
    const input = within(container).getByLabelText('Date du prochain comité')
    fireEvent.change(input, { target: { value } })
    return input
  }

  function jeTapeUnCommentaire(container: HTMLElement, value: string): HTMLElement {
    const input = within(container).getByRole('textbox', { name: 'Description' })
    fireEvent.change(input, { target: { value } })
    return input
  }

  function jOuvreLeFormulairePourModifierUnComite(): void {
    presserLeBouton('Comité technique')
  }

  function jeFermeLeFormulairePourModifierUnComite(): HTMLElement {
    return presserLeBouton('Fermer la modification du Comité technique')
  }

  function afficherUneGouvernance(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory(), epochTimePlusOneDay)
    renderComponent(<Gouvernance />, options, gouvernanceViewModel)
  }

  function presserLeBouton(name: string): HTMLElement {
    const button = screen.getByRole('button', { name })
    fireEvent.click(button)
    return button
  }
})
