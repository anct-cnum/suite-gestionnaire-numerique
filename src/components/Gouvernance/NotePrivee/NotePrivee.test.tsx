import { fireEvent, screen, within } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { matchWithoutMarkup, presserLeBouton, presserLeBoutonDans, renderComponent, saisirLeTexte, stubbedServerAction } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { epochTime } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('note privée', () => {
  it('quand j’affiche une gouvernance sans note privée, alors elle s’affiche avec son résumé vide lui demandant d’en ajouter une', () => {
    // WHEN
    afficherUneGouvernanceSansNotePrivee()

    // THEN
    const resumeTitre = screen.getByText('Créez une note privée', { selector: 'p' })
    expect(resumeTitre).toBeInTheDocument()
    const resumeSousTitre = screen.getByText('Elle sera uniquement accessible par vous et votre équipe interne.', { selector: 'p' })
    expect(resumeSousTitre).toBeInTheDocument()
    const ajouterUneNotePrivee = screen.getByRole('button', { name: 'Rédiger une note' })
    expect(ajouterUneNotePrivee).toHaveAttribute('aria-controls', 'drawerAjouterNotePriveeId')
    expect(ajouterUneNotePrivee).toHaveAttribute('type', 'button')
  })

  it('quand j’affiche une gouvernance avec une note privée, alors elle s’affiche avec son résumé limité à 290 caractères et son édition', () => {
    // WHEN
    afficherUneGouvernanceAvecNotePrivee()

    // THEN
    const contenu = screen.getByText(matchWithoutMarkup('Note privée (interne)lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim...'), { selector: 'p' })
    expect(contenu).toBeInTheDocument()
    const edition = screen.getAllByText('Modifié le 01/01/1970 par Lucie Lu', { selector: 'p' })[0]
    expect(edition).toBeInTheDocument()
  })

  it('en étant non coporteur sur la gouvernance quand j‘affiche une gouvernance avec une note privée, alors elle ne s’affiche pas', () => {
    // WHEN
    afficherUneGouvernanceAvecNotePriveeNonCoPorteur()

    // THEN
    const contenu = screen.queryByText(matchWithoutMarkup('Note privée (interne)lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim...'), { selector: 'p' })
    expect(contenu).not.toBeInTheDocument()
  })

  describe('quand je clique sur rédiger une note privée,', () => {
    it('alors s’affiche le formulaire de création', () => {
      // GIVEN
      afficherUneGouvernanceSansNotePrivee()

      // WHEN
      jouvreLeFormulairePourAjouterUneNotePrivee()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Note privée' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterNotePriveeId')
      const formulaire = within(drawer).getByRole('form', { name: 'Note privée' })
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Note privée' })
      expect(titre).toBeInTheDocument()
      const sousTitre = within(formulaire).getByText('Uniquement accessibles par vous et votre équipe interne.', { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()
      const note = within(formulaire).getByRole('textbox', { name: 'Votre note' })
      expect(note).toHaveAttribute('maxLength', '500')
      const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toHaveAttribute('aria-controls', 'drawerAjouterNotePriveeId')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneGouvernanceSansNotePrivee()

      // WHEN
      jouvreLeFormulairePourAjouterUneNotePrivee()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Note privée' })
      const fermer = jeFermeLeFormulairePourAjouterUneNotePrivee()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterNotePriveeId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je remplis correctement le formulaire, alors le drawer se ferme, une notification s‘affiche, la gouvernance est mise à jour', async () => {
      // GIVEN
      const ajouterUneNotePriveeAction = stubbedServerAction(['OK'])
      afficherUneGouvernanceSansNotePrivee({ ajouterUneNotePriveeAction, pathname: '/gouvernance/11' })

      // WHEN
      jouvreLeFormulairePourAjouterUneNotePrivee()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Note privée' })
      jeTapeUneNotePrivee('un exemple de contenu de note privée')
      const enregistrer = jEnregistreLaNotePrivee()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Ajout en cours...')
      expect(enregistrer).toBeDisabled()
      expect(ajouterUneNotePriveeAction).toHaveBeenCalledWith({
        contenu: 'un exemple de contenu de note privée',
        path: '/gouvernance/11',
        uidGouvernance: 'gouvernanceFooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Note privée ajoutée')
      expect(drawer).not.toBeVisible()
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je le modifie mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const ajouterUneNotePriveeAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      afficherUneGouvernanceSansNotePrivee({ ajouterUneNotePriveeAction, pathname: '/gouvernance/11' })

      // WHEN
      jouvreLeFormulairePourAjouterUneNotePrivee()
      jEnregistreLaNotePrivee()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })

    function jouvreLeFormulairePourAjouterUneNotePrivee(): void {
      presserLeBouton('Rédiger une note')
    }

    function jeFermeLeFormulairePourAjouterUneNotePrivee(): HTMLElement {
      return presserLeBouton('Fermer le formulaire de création d’une note privée')
    }
  })

  describe('quand je clique sur modifier une note privée,', () => {
    it('alors s’affiche le formulaire de modification', () => {
      // GIVEN
      afficherUneGouvernanceAvecNotePrivee()

      // WHEN
      jouvreLeFormulairePourModifierUneNotePrivee()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Note privée' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterNotePriveeId')
      const formulaire = within(drawer).getByRole('form', { name: 'Note privée' })
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Note privée' })
      expect(titre).toBeInTheDocument()
      const sousTitre = within(formulaire).getByText('Uniquement accessibles par vous et votre équipe interne.', { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()
      const note = within(formulaire).getByRole('textbox', { name: 'Votre note' })
      expect(note).toHaveAttribute('maxLength', '500')
      expect(note).toHaveValue('lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna.')
      const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toHaveAttribute('aria-controls', 'drawerAjouterNotePriveeId')
      expect(enregistrer).toBeEnabled()
      const effacer = within(formulaire).getByRole('button', { name: 'Effacer' })
      expect(effacer).toHaveAttribute('type', 'reset')
      expect(effacer).toBeEnabled()
      const edition = within(formulaire).getByText('Modifié le 01/01/1970 par Lucie Lu', { selector: 'p' })
      expect(edition).toBeInTheDocument()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneGouvernanceAvecNotePrivee()

      // WHEN
      jouvreLeFormulairePourModifierUneNotePrivee()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Note privée' })
      const fermer = jeFermeLeFormulairePourModifierUneNotePrivee()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterNotePriveeId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je remplis correctement le formulaire, alors le drawer se ferme, une notification s’affiche, la gouvernance est mise à jour', async () => {
      // GIVEN
      const modifierUneNotePriveeAction = stubbedServerAction(['OK'])
      afficherUneGouvernanceAvecNotePrivee({ modifierUneNotePriveeAction, pathname: '/gouvernance/11' })

      // WHEN
      jouvreLeFormulairePourModifierUneNotePrivee()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Note privée' })
      jeTapeUneNotePrivee('modification de la note privée')
      const enregistrer = jEnregistreLaNotePrivee()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Modification en cours...')
      expect(enregistrer).toBeDisabled()
      expect(modifierUneNotePriveeAction).toHaveBeenCalledWith({
        contenu: 'modification de la note privée',
        path: '/gouvernance/11',
        uidGouvernance: 'gouvernanceFooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Note privée modifiée')
      expect(drawer).not.toBeVisible()
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je le modifie mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const modifierUneNotePriveeAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      afficherUneGouvernanceAvecNotePrivee({ modifierUneNotePriveeAction, pathname: '/gouvernance/11' })

      // WHEN
      jouvreLeFormulairePourModifierUneNotePrivee()
      jEnregistreLaNotePrivee()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })

    it('puis que je veux supprimer la note privée, alors le drawer se ferme, une notification s’affiche, la gouvernance est mise à jour', async () => {
      // GIVEN
      const supprimerUneNotePriveeAction = stubbedServerAction(['OK'])
      afficherUneGouvernanceAvecNotePrivee({ pathname: '/gouvernance/11', supprimerUneNotePriveeAction })

      // WHEN
      jouvreLeFormulairePourModifierUneNotePrivee()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Note privée' })
      jEffaceLaNotePrivee(drawer)
      const enregistrer = jEnregistreLaNotePrivee()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Modification en cours...')
      expect(enregistrer).toBeDisabled()
      expect(supprimerUneNotePriveeAction).toHaveBeenCalledWith({
        path: '/gouvernance/11',
        uidGouvernance: 'gouvernanceFooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Note privée supprimée')
      expect(drawer).not.toBeVisible()
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je veux supprimer la note privée mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const supprimerUneNotePriveeAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      afficherUneGouvernanceAvecNotePrivee({ pathname: '/gouvernance/11', supprimerUneNotePriveeAction })

      // WHEN
      jouvreLeFormulairePourModifierUneNotePrivee()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Note privée' })
      jEffaceLaNotePrivee(drawer)
      jEnregistreLaNotePrivee()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })

    function jouvreLeFormulairePourModifierUneNotePrivee(): void {
      presserLeBouton('Modifier la note')
    }

    function jeFermeLeFormulairePourModifierUneNotePrivee(): HTMLElement {
      return presserLeBouton('Fermer le formulaire de modification d‘une note privée')
    }

    function jEffaceLaNotePrivee(context: HTMLElement): void {
      presserLeBoutonDans(context, 'Effacer')
    }
  })

  function jeTapeUneNotePrivee(value: string): void {
    saisirLeTexte('Votre note', value)
  }

  function jEnregistreLaNotePrivee(): HTMLElement {
    const form = screen.getByRole('form', { name: 'Note privée' })
    const enregistrer = within(form).getByRole('button', { name: 'Enregistrer' })
    fireEvent.click(enregistrer)
    return enregistrer
  }

  function afficherUneGouvernanceSansNotePrivee(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
    const gouvernanceViewModel = {
      ...gouvernancePresenter(gouvernanceReadModelFactory({ notePrivee: undefined }), now),
      peutVoirNotePrivee: true,
    }
    renderComponent(<Gouvernance />, options, gouvernanceViewModel)
  }

  function afficherUneGouvernanceAvecNotePrivee(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
    const gouvernanceViewModel = {
      ...gouvernancePresenter(gouvernanceReadModelFactory({
        notePrivee: {
          dateDEdition: epochTime,
          nomEditeur: 'Lu',
          prenomEditeur: 'Lucie',
          texte: 'lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna.',
        },
      }), now),
      peutVoirNotePrivee: true,
    }
    renderComponent(<Gouvernance />, options, gouvernanceViewModel)
  }

  function afficherUneGouvernanceAvecNotePriveeNonCoPorteur(
    options?: Partial<Parameters<typeof renderComponent>[1]>
  ): void {
    const gouvernanceViewModel = {
      ...gouvernancePresenter(gouvernanceReadModelFactory({
        notePrivee: {
          dateDEdition: epochTime,
          nomEditeur: 'Lu',
          prenomEditeur: 'Lucie',
          texte: 'lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna. lrutrum metus sodales semper velit habitant dignissim lacus suspendisse magna.',
        },
      }), now),
      peutVoirNotePrivee: false,
    }
    renderComponent(<Gouvernance />, options, gouvernanceViewModel)
  }

  const now = epochTime
})
