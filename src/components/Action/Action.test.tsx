import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { FormEvent } from 'react'
import { Mock } from 'vitest'

import AjouterUneAction from './AjouterUneAction'
import { FormulaireAction } from './FormulaireAction'
import MenuLateral from './MenuLateral'
import ModifierUneAction from './ModifierUneAction'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { matchWithoutMarkup, renderComponent, stubbedServerAction } from '../testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { actionVideViewModelFactory, actionViewModelFactory } from '@/presenters/testHelper'
import { epochTime } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('formulaire d‘ajout d‘une action', () => {
  describe('menu latéral', () => {
    it.each([
      { lien: 'besoinsAction', titre: 'Besoins liés à l‘action' },
      { lien: 'informationsAction', titre: 'Informations sur l‘action' },
      { lien: 'porteurAction', titre: 'Porteur de l‘action' },
      { lien: 'temporaliteAction', titre: 'Temporalité de l‘action' },
      { lien: 'budgetAction', titre: 'Information sur le budget et le financement' },
      { lien: 'destinatairesFonds', titre: 'Destinataire(s) des fonds' },
    ])('étant un utilisateur, lorsque je veux ajouter une action, alors je vois le menu latéral avec le lien %s', ({ lien, titre }) => {
      // WHEN
      afficherMenuLateral()

      // THEN
      const menuLateral = screen.getByRole('navigation', { name: 'Menu' })
      const lienMenu = within(menuLateral).getByRole('link', { name: titre })
      expect(lienMenu).toHaveAttribute('href', `#${lien}`)
      const lienActif = within(menuLateral).getByRole('link', { name: 'Besoins liés à l‘action' })
      expect(lienActif).toHaveAttribute('aria-current', 'page')
    })

    it.each([
      { lien: 'besoinsAction', titre: 'Besoins liés à l‘action' },
      { lien: 'informationsAction', titre: 'Informations sur l‘action' },
      { lien: 'porteurAction', titre: 'Porteur de l‘action' },
      { lien: 'temporaliteAction', titre: 'Temporalité de l‘action' },
      { lien: 'budgetAction', titre: 'Information sur le budget et le financement' },
      { lien: 'destinatairesFonds', titre: 'Destinataire(s) des fonds' },
    ])('étant un utilisateur, lorsque je clique sur le lien $titre, alors ce lien devient actif', ({ titre }) => {
      // GIVEN
      afficherMenuLateral()
      const menuLateral = screen.getByRole('navigation', { name: 'Menu' })
      const lienACliquer = within(menuLateral).getByRole('link', { name: titre })

      // WHEN
      fireEvent.click(lienACliquer)

      // THEN
      expect(lienACliquer).toHaveAttribute('aria-current', 'page')
    })

    it('étant un utilisateur, lorsque je clique sur un lien du menu, alors ce lien devient actif', () => {
      // GIVEN
      afficherMenuLateral()

      // WHEN
      const menuLateral = screen.getByRole('navigation', { name: 'Menu' })
      const lienPorteur = within(menuLateral).getByRole('link', { name: 'Porteur de l‘action' })
      fireEvent.click(lienPorteur)

      // THEN
      expect(lienPorteur).toHaveAttribute('aria-current', 'page')
      const lienBesoin = within(menuLateral).getByRole('link', { name: 'Besoins liés à l‘action' })
      expect(lienBesoin).not.toHaveAttribute('aria-current')
    })
  })

  describe('formulaire', () => {
    it('étant un utilisateur,lorsque je veux ajouter une action, alors je vois le formulaire d‘ajout d‘une action', () => {
      // WHEN
      afficherFormulaireDeCreationAction()

      // THEN
      const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
      const lienVersLaFeuilleDeRoute = within(formulaire).getByRole('link', { name: 'Feuille de route 69' })
      expect(lienVersLaFeuilleDeRoute).toHaveAttribute('href', '/gouvernance/11/feuille-de-route/116')
      expect(lienVersLaFeuilleDeRoute).toBeInTheDocument()
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Ajouter une action à la feuille de route' })
      expect(titre).toBeInTheDocument()
      const badgeEnConstruction = within(formulaire).getByText('En construction', { selector: 'p' })
      expect(badgeEnConstruction).toBeInTheDocument()
      const titreIndicationDuBesoin = within(formulaire).getByText(matchWithoutMarkup('Besoins liés à l‘action *'), { selector: 'p' })
      expect(titreIndicationDuBesoin).toBeInTheDocument()
      const boutonAjouter = within(formulaire).getByRole('button', { description: 'Ajouter des besoins',name: 'Ajouter'  })
      expect(boutonAjouter).toBeInTheDocument()
      const texteIndicationDuBesoin = within(formulaire).getByText('Indiquez à quels besoins se rapporte l’action pour laquelle vous demandez une subvention.', { selector: 'p' })
      expect(texteIndicationDuBesoin).toBeInTheDocument()
      const titreSectionInformationSurLAction = within(formulaire).getByText('Informations sur l‘action', { selector: 'p' })
      expect(titreSectionInformationSurLAction).toBeInTheDocument()
      const nomDeLAction = within(formulaire).getByRole('textbox', { name: 'Nom de l‘action *' })
      expect(nomDeLAction).toBeRequired()
      expect(nomDeLAction).toHaveAttribute('name', 'nom')
      expect(nomDeLAction).toHaveAttribute('type', 'text')
      expect(nomDeLAction).toHaveValue('')
      const contexteDeLAction = within(formulaire).getByText(matchWithoutMarkup('Contexte de l‘action *'))
      expect(contexteDeLAction).toBeInTheDocument()
      const labelContexteAction = within(formulaire).getAllByText('Préciser la nature de l‘action, ses objectifs, ses bénéficiaires, son impact et indicateurs associés.')[0]
      expect(labelContexteAction).toBeInTheDocument()
      const labelDescriptionAction = within(formulaire).getAllByText('Préciser la nature de l‘action, ses objectifs, ses bénéficiaires, son impact et indicateurs associés.')[1]
      expect(labelDescriptionAction).toBeInTheDocument()
      const editeurDeTexteContexte = within(formulaire).getAllByRole('textarea')[0]
      expect(editeurDeTexteContexte).toBeInTheDocument()
      const descriptionDeLAction = within(formulaire).getByText(matchWithoutMarkup('Description de l‘action *'))
      expect(descriptionDeLAction).toBeInTheDocument()
      const editeurDeTexteDescription = within(formulaire).getAllByRole('textarea')[1]
      expect(editeurDeTexteDescription).toBeInTheDocument()
      const titreSectionPorteurDeLAaction = within(formulaire).getByText('Porteur de l‘action', { selector: 'p' })
      expect(titreSectionPorteurDeLAaction).toBeInTheDocument()
      const labelSectionPorteurDeLAaction = within(formulaire).getByText('Indiquez quelle est la structure porteuse de cette action', { selector: 'p' })
      expect(labelSectionPorteurDeLAaction).toBeInTheDocument()
      const boutonAjouterLePorteurDeLAaction = within(formulaire).getByRole('button', { description: 'Ajouter des porteurs', name: 'Ajouter' })
      expect(boutonAjouterLePorteurDeLAaction).toBeInTheDocument()
      const titreSectionTemporaliteDeLAaction = within(formulaire).getByText('Temporalité de l‘action', { selector: 'p' })
      expect(titreSectionTemporaliteDeLAaction).toBeInTheDocument()
      const labelSectionTemporaliteDeLAaction = within(formulaire).getByText('Veuillez indiquer si cette action est annuelle ou pluriannuelle', { selector: 'p' })
      expect(labelSectionTemporaliteDeLAaction).toBeInTheDocument()
      const annuelle = within(formulaire).getByRole('radio', { name: 'Annuelle' })
      expect(annuelle).toHaveAttribute('value', 'annuelle')
      expect(annuelle).toBeChecked()
      const pluriannuelle = within(formulaire).getByRole('radio', { name: 'Pluriannuelle' })
      expect(pluriannuelle).toHaveAttribute('value', 'pluriannuelle')
      expect(pluriannuelle).not.toBeChecked()
      const selecteurAnneeDeDebut = within(formulaire).getByLabelText('Année de début de l‘action')
      expect(selecteurAnneeDeDebut).toHaveAttribute('name', 'anneeDeDebut')
      const selecteurAnneeDeFin = within(formulaire).getByLabelText('Année de fin de l‘action')
      expect(selecteurAnneeDeFin).toHaveAttribute('name', 'anneeDeFin')
      expect(selecteurAnneeDeFin).toBeDisabled()
      const titreSectionInformationBudget = within(formulaire).getByText('Information sur le budget et le financement', { selector: 'p' })
      expect(titreSectionInformationBudget).toBeInTheDocument()
      const instructionsInformationBudget = within(formulaire).getByText('Détaillez le budget prévisionnel de l‘action incluant les subventions et les co-financements éventuels des membres ou ...', { selector: 'p' })
      expect(instructionsInformationBudget).toBeInTheDocument()
      const budgetGlobalDeLAction = within(formulaire).getByRole('spinbutton', { name: 'Budget global de l‘action *' })
      expect(budgetGlobalDeLAction).toBeRequired()
      expect(budgetGlobalDeLAction).toHaveAttribute('name', 'budgetGlobal')
      expect(budgetGlobalDeLAction).toHaveAttribute('type', 'number')
      expect(budgetGlobalDeLAction).toHaveAttribute('min', '0')
      expect(budgetGlobalDeLAction).toHaveValue(0)
      const demandeDeSubvention = within(formulaire).getByText('Subvention demandée à l‘état')
      expect(demandeDeSubvention).toBeInTheDocument()
      const boutonDemanderUneSubvention = within(formulaire).getByRole('button', { name: 'Demander une subvention' })
      expect(boutonDemanderUneSubvention).toHaveAttribute('type', 'button')
      const coFinancement = within(formulaire).getByText('Co-financement')
      expect(coFinancement).toBeInTheDocument()
      const boutonAjouterUnFinancement = within(formulaire).getByRole('button', { name: 'Ajouter un financement' })
      expect(boutonAjouterUnFinancement).toBeDisabled()
      const titreSectionDestinattairesDesFonds = within(formulaire).getByText(matchWithoutMarkup('Destinataire(s) des fonds *'), { selector: 'p' })
      expect(titreSectionDestinattairesDesFonds).toBeInTheDocument()
      const boutonAjouterUnDestinataire = within(formulaire).getByRole('button', { description: 'Ajouter des bénéficiaires des fonds', name: 'Ajouter' })
      expect(boutonAjouterUnDestinataire).toBeInTheDocument()
      const instructionsAjoutDestinaire = within(formulaire).getByText('Précisez le ou les membres de votre gouvernance qui seront destinataires des fonds.', { selector: 'p' })
      expect(instructionsAjoutDestinaire).toBeInTheDocument()
      const boutonDeValidation = within(formulaire).getByRole('button', { name: 'Valider et envoyer' })
      expect(boutonDeValidation).toBeEnabled()
    })

    it('étant un utilisateur, lorsque je remplis correctement le formulaire, alors je peux le valider', async () => {
      // GIVEN
      const ajouterUneActionAction = stubbedServerAction(['OK'])
      afficherFormulaireDeCreationValidation(ajouterUneActionAction)

      // WHEN
      const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
      jeTapeLeNomDeLAction(formulaire)
      jeTapeLeContexteDeLaction(formulaire)
      jeTapeLaDescriptionDeLaction(formulaire)
      jeTapeLeBudgetGlobalDeLAction(formulaire)
      jeSelectionneLAnneeDeDebut('2026')
      jeValideLeFormulaireDAjout()

      // THEN
      await waitFor(() => {
        expect(ajouterUneActionAction).toHaveBeenCalledWith({
          anneeDeDebut: '2026',
          anneeDeFin: undefined,
          budgetGlobal: 1000,
          contexte: '<p>Contexte de l‘action</p>',
          description: '<p><strong>Description de l‘action.</strong></p>',
          destinataires: [],
          nom: 'Structurer une filière de reconditionnement locale 1',
          porteur: '',
          temporalite: 'annuelle',
        })
      })
    })

    it('étant un utilisateur, lorsque j‘ouvre le formulaire de modification d‘une action, alors je vois le contenu de l‘action', () => {
      // WHEN
      afficherFormulaireDeModificationAction()

      // THEN
      const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
      const boutonModifierLesBesoins = within(formulaire).getByRole('button', { description: 'Modifier les besoins', name: 'Modifier' })
      expect(boutonModifierLesBesoins).toBeInTheDocument()
      const nomDeLAction = within(formulaire).getByRole('textbox', { name: 'Nom de l‘action *' })
      expect(nomDeLAction).toHaveValue('Structurer une filière de reconditionnement locale 1')
      const porteurAction = within(formulaire).getByRole('link', { name: 'CC des Monts du Lyonnais' })
      expect(porteurAction).toHaveAttribute('href', '/gouvernance/69/membre/membreFooId2')
      const optionAnnuelle = screen.getByRole('radio', { name: 'Annuelle' })
      expect(optionAnnuelle).toBeChecked()
      const optionPluriannuelle = screen.getByRole('radio', { name: 'Pluriannuelle' })
      expect(optionPluriannuelle).not.toBeChecked()
      const selecteurAnneeDeDebut = within(formulaire).getByLabelText('Année de début de l‘action')
      expect(selecteurAnneeDeDebut).toHaveValue('2025')
      const selecteurAnneeDeFin = within(formulaire).getByLabelText('Année de fin de l‘action')
      expect(selecteurAnneeDeFin).toHaveValue('2026')
      const budgetGlobalDeLAction = within(formulaire).getByRole('spinbutton', { name: 'Budget global de l‘action *' })
      expect(budgetGlobalDeLAction).toHaveValue(50000)
      const premierBeneficiaire = within(formulaire).getByRole('link', { name: 'Rhône (69)' })
      expect(premierBeneficiaire).toHaveAttribute('href', '/gouvernance/69/membre/membreFooId3')
      const listeCofinancements = within(formulaire).getAllByRole('listitem')
      expect(listeCofinancements).toHaveLength(4)
      const premierCofinancement = within(listeCofinancements[0]).getByText('Budget prévisionnel 2024')
      expect(premierCofinancement).toBeInTheDocument()
      const montantPremierCofinancement = within(listeCofinancements[0]).getByText('20 000 €')
      expect(montantPremierCofinancement).toBeInTheDocument()
      const deuxiemeCofinancement = within(listeCofinancements[1]).getByText('Subvention de prestation')
      const montantDeuxiemeCofinancement = within(listeCofinancements[1]).getByText('10 000 €')
      expect(montantDeuxiemeCofinancement).toBeInTheDocument()
      expect(deuxiemeCofinancement).toBeInTheDocument()
      const troisiemeCofinancement = within(listeCofinancements[2]).getByText('CC des Monts du Lyonnais')
      expect(troisiemeCofinancement).toBeInTheDocument()
      const montantTroisiemeCofinancement = within(listeCofinancements[2]).getByText('5 000 €')
      expect(montantTroisiemeCofinancement).toBeInTheDocument()
      const quatriemeCofinancement = within(listeCofinancements[3]).getByText('Croix Rouge Française')
      expect(quatriemeCofinancement).toBeInTheDocument()
      const montantQuatriemeCofinancement = within(listeCofinancements[3]).getByText('5 000 €')
      expect(montantQuatriemeCofinancement).toBeInTheDocument()
      const boutonSupprimerCofinancement = within(listeCofinancements[3]).getByRole('button', { name: 'Supprimer' })
      expect(boutonSupprimerCofinancement).toBeInTheDocument()
    })

    it('étant un utilisateur, lorsque je clique sur le bouton supprimer un cofinancement dans le formulaire de création, alors le cofinancement est supprimé', async () => {
      // GIVEN
      afficherFormulaireDeCreationAction()

      // WHEN
      const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
      jeTapeLeBudgetGlobalDeLAction(formulaire)
      jOuvreLeFormulairePourAjouterUnCoFinancement()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
      jeCreeUnCofinancementDansLeDrawer(drawer)
      const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
      fireEvent.click(boutonEnregistrer)
      const listeCofinancements = await within(formulaire).findAllByRole('listitem')
      const boutonSupprimerCofinancement = within(listeCofinancements[0]).getByRole('button', { name: 'Supprimer' })
      fireEvent.click(boutonSupprimerCofinancement)

      // THEN
      const listeCofinancementsApresSuppression = within(formulaire).queryAllByRole('listitem')
      expect(listeCofinancementsApresSuppression).toHaveLength(0)
    })

    it('étant un utilisateur, lorsque je clique sur le bouton supprimer un cofinancement dans le formulaire de modification, alors le cofinancement est supprimé', () => {
      // GIVEN
      afficherFormulaireDeModificationAction()

      // WHEN
      const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
      const listeCofinancements = within(formulaire).getAllByRole('listitem')
      const boutonSupprimerCofinancement = within(listeCofinancements[3]).getByRole('button', { name: 'Supprimer' })
      fireEvent.click(boutonSupprimerCofinancement)

      // THEN
      const listeCofinancementsApresSuppression = within(formulaire).getAllByRole('listitem')
      expect(listeCofinancementsApresSuppression).toHaveLength(3)
    })

    it('étant un utilisateur, lorsque je modifie une action, alors je peux la valider', async () => {
      // GIVEN
      const modifierUneActionAction = stubbedServerAction(['OK'])
      afficherFormulaireDeModificationAction(modifierUneActionAction)

      // WHEN
      const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
      const nomDeLAction = within(formulaire).getByRole('textbox', { name: 'Nom de l‘action *' })
      fireEvent.change(nomDeLAction, { target: { value: 'Structurer une filière de reconditionnement locale 2' } })
      jeTapeLeContexteDeLaction(formulaire)
      jeTapeLaDescriptionDeLaction(formulaire)
      fireEvent.click(screen.getByRole('radio', { name: 'Pluriannuelle' }))
      jeSelectionneLAnneeDeDebut('2026')
      jeSelectionneLAnneeDeFin('2028')
      jeTapeLeBudgetGlobalDeLAction(formulaire)
      const boutonDeValidation = screen.getByRole('button', { name: 'Valider et envoyer' })
      fireEvent.click(boutonDeValidation)

      // THEN
      await waitFor(() => {
        expect(modifierUneActionAction).toHaveBeenCalledWith({
          anneeDeDebut: '2026',
          anneeDeFin: '2028',
          budgetGlobal: 1000,
          contexte: '<p>Contexte de l‘action</p>',
          description: '<p><strong>Description de l‘action.</strong></p>',
          destinataires: [],
          nom: 'Structurer une filière de reconditionnement locale 2',
          porteur: '',
          temporalite: 'pluriannuelle',
          uid: '',
        })
      })
    })

    it('étant un utilisateur, lorsque je clique sur le bouton radio annuelle, alors il est coché', () => {
      // GIVEN
      afficherFormulaireDeCreationAction()

      // WHEN
      fireEvent.click(screen.getByRole('radio', { name: 'Annuelle' }))

      // THEN
      const optionAnnuelle = screen.getByRole('radio', { name: 'Annuelle' })
      expect(optionAnnuelle).toBeChecked()
    })

    it('étant un utilisateur, lorsque je remplis correctement le formulaire, alors je peux voir les différents états du bouton', () => {
      // GIVEN
      const ajouterUneActionAction = stubbedServerAction(['OK'])
      renderComponent(
        <AjouterUneAction
          action={actionViewModelFactory()}
          date={epochTime}
        />,
        { ajouterUneActionAction }
      )

      // WHEN
      const boutonDeValidation = jeValideLeFormulaireDAjout()

      // THEN
      expect(boutonDeValidation.textContent).toBe('Ajout en cours...')
      expect(boutonDeValidation).toBeDisabled()
    })

    it('étant un utilisateur, lorsque je remplis correctement le formulaire mais qu‘une erreur intervient, alors une notification s‘affiche', async () => {
      // GIVEN
      const ajouterUneActionAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      renderComponent(
        <AjouterUneAction
          action={actionVideViewModelFactory()}
          date={epochTime}
        />,
        { ajouterUneActionAction }
      )

      // WHEN
      const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
      const nomDeLAction = within(formulaire).getByRole('textbox', { name: 'Nom de l‘action *' })
      fireEvent.change(nomDeLAction, { target: { value: 'Structurer une filière de reconditionnement locale 1' } })
      jeTapeLeBudgetGlobalDeLAction(formulaire)
      jeSelectionneLAnneeDeDebut('2026')
      jeValideLeFormulaireDAjout()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })

    it('étant un utilisateur, lorsque je modifie correctement le formulaire mais qu‘une erreur intervient, alors une notification s‘affiche', async () => {
      // GIVEN
      const modifierUneActionAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      renderComponent(
        <ModifierUneAction
          action={actionVideViewModelFactory()}
        />,
        { modifierUneActionAction }
      )

      // WHEN
      const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
      const nomDeLAction = within(formulaire).getByRole('textbox', { name: 'Nom de l‘action *' })
      fireEvent.change(nomDeLAction, { target: { value: 'Structurer une filière de reconditionnement locale 1' } })
      jeTapeLeBudgetGlobalDeLAction(formulaire)
      jeSelectionneLAnneeDeDebut('2026')
      jeValideLeFormulaireDeModification()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })

    it('étant un utilisateur, quand je change la temporalite à annuelle, la temporalite est mise à jour', () => {
      // GIVEN
      afficherFormulaireDeCreationAction()
      fireEvent.click(screen.getByRole('radio', { name: 'Pluriannuelle' }))

      // WHEN
      fireEvent.click(screen.getByRole('radio', { name: 'Annuelle' }))

      // THEN
      const radioAnnuelle = screen.getByRole('radio', { name: 'Annuelle' })
      expect(radioAnnuelle).toBeChecked()
      expect(screen.getByRole('radio', { name: 'Pluriannuelle' })).not.toBeChecked()
      expect(screen.getByLabelText('Année de fin de l‘action')).toBeDisabled()
    })

    it('étant un utilisateur, quand je renseigne le budget global, les boutons de demande de subvention et de co-financement sont activés', () => {
      // GIVEN
      afficherFormulaireDeCreationAction()

      // WHEN
      const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
      jeTapeLeBudgetGlobalDeLAction(formulaire)

      // THEN
      const boutonDemanderUneSubvention = screen.getByRole('button', { name: 'Demander une subvention' })
      expect(boutonDemanderUneSubvention).toBeEnabled()
      const boutonAjouterUnFinancement = screen.getByRole('button', { name: 'Ajouter un financement' })
      expect(boutonAjouterUnFinancement).toBeEnabled()
    })
  })
})

export function afficherFormulaireDeCreationAction(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
  const gouvernanceViewModel = gouvernancePresenter(
    gouvernanceReadModelFactory({
      syntheseMembres: {
        candidats: 0,
        coporteurs: [
          {
            contactReferent: {
              denomination: 'Contact référent',
              mailContact: 'john.doe@example.com',
              nom: 'Doe',
              poste: 'Chargé de mission',
              prenom: 'John',
            },
            feuillesDeRoute: [],
            links: {},
            nom: 'CC des Monts du Lyonnais',
            roles: [],
            telephone: '+33 1 23 45 67 89',
            type: '',
            uid: 'membreFooId2',
          },
          {
            contactReferent: {
              denomination: 'Contact référent',
              mailContact: 'john.doe@example.com',
              nom: 'Doe',
              poste: 'Chargé de mission',
              prenom: 'John',
            },
            feuillesDeRoute: [],
            links: {},
            nom: 'Croix Rouge Française',
            roles: [],
            telephone: '+33 1 23 45 67 89',
            type: '',
            uid: 'membreFooId3',
          },
          {
            contactReferent: {
              denomination: 'Contact référent',
              mailContact: 'john.doe@example.com',
              nom: 'Doe',
              poste: 'Chargé de mission',
              prenom: 'John',
            },
            feuillesDeRoute: [],
            links: {},
            nom: 'La Poste',
            roles: [],
            telephone: '+33 1 23 45 67 89',
            type: '',
            uid: 'membreFooId4',
          },
        ],
        total: 1,
      },
    }),
    epochTime
  )
  renderComponent(
    <AjouterUneAction
      action={actionVideViewModelFactory()}
      date={epochTime}
    />,
    options,
    gouvernanceViewModel
  )
}

export function afficherFormulaireDeModificationAction(
  modifierUneActionAction: Mock = vi.fn<() => Promise<ReadonlyArray<string>>>()
): void {
  const gouvernanceViewModel = gouvernancePresenter(
    gouvernanceReadModelFactory({
      syntheseMembres: {
        candidats: 0,
        coporteurs: [
          {
            contactReferent: {
              denomination: 'Contact référent',
              mailContact: 'john.doe@example.com',
              nom: 'Doe',
              poste: 'Chargé de mission',
              prenom: 'John',
            },
            feuillesDeRoute: [],
            links: {},
            nom: 'CC des Monts du Lyonnais',
            roles: [],
            telephone: '+33 1 23 45 67 89',
            type: '',
            uid: 'membreFooId2',
          },
        ],
        total: 1,
      },
    }),
    epochTime
  )
  renderComponent(
    <ModifierUneAction
      action={actionViewModelFactory()}
    />,
    { modifierUneActionAction },
    gouvernanceViewModel
  )
}

export function jeTapeLeBudgetGlobalDeLAction(formulaire: HTMLElement): void {
  const budgetGlobal = within(formulaire).getByRole('spinbutton', { name: 'Budget global de l‘action *' })
  fireEvent.change(budgetGlobal, { target: { value: 1000 } })
}

export function jOuvreLeFormulairePourAjouterUnCoFinancement(): void {
  const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
  const boutonAjouterUnCoFinanacement = within(formulaire).getByRole('button', { name: 'Ajouter un financement' })
  fireEvent.click(boutonAjouterUnCoFinanacement)
}

export function jeCreeUnCofinancementDansLeDrawer(drawer: HTMLElement): void {
  const selecteurOrigineDuFinancement = within(drawer).getByRole('combobox', { name: 'Membre de la gouvernance' })
  fireEvent.change(selecteurOrigineDuFinancement, { target: { value: 'CC des Monts du Lyonnais' } })
  const montantDuFinancement = within(drawer).getByRole('spinbutton', { name: /Montant du financement \*/ })
  fireEvent.change(montantDuFinancement, { target: { value: 1000 } })
}

function afficherFormulaireDeCreationValidation(
  ajouterUneActionAction: Mock = vi.fn<() => Promise<ReadonlyArray<string>>>()
): void {
  const validerFormulaire = async (
    event: FormEvent<HTMLFormElement>,
    contexte: string,
    description: string
  ): Promise<void> => {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    await ajouterUneActionAction({
      anneeDeDebut: formData.get('anneeDeDebut') as string,
      anneeDeFin: undefined,
      budgetGlobal: Number(formData.get('budgetGlobal')),
      contexte,
      description,
      destinataires: [],
      nom: formData.get('nom') as string,
      porteur: '',
      temporalite: 'annuelle',
    })
  }

  renderComponent(
    <FormulaireAction
      action={actionViewModelFactory()}
      cofinancements={[]}
      date={epochTime}
      drawerId=""
      label="Ajouter une action à la feuille de route"
      setIsDrawerOpen={vi.fn<() => void>()}
      supprimerUnCofinancement={vi.fn<() => void>()}
      validerFormulaire={validerFormulaire}
    >
      <SubmitButton
        isDisabled={false}
      >
        Valider et envoyer
      </SubmitButton>
    </FormulaireAction>,
    { ajouterUneActionAction }
  )
}

function afficherMenuLateral(): void {
  renderComponent(<MenuLateral />)
}

function jeSelectionneLAnneeDeDebut(annee: string): void {
  const selectAnneeDebut = screen.getByLabelText('Année de début de l‘action')
  fireEvent.change(selectAnneeDebut, { target: { value: annee } })
}

function jeSelectionneLAnneeDeFin(annee: string): void {
  const selectAnneeDeFin = screen.getByLabelText('Année de fin de l‘action')
  fireEvent.change(selectAnneeDeFin, { target: { value: annee } })
}

function jeValideLeFormulaireDAjout(): HTMLElement {
  const form = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
  const button = within(form).getByRole('button', { name: 'Valider et envoyer' })
  fireEvent.click(button)
  return button
}

function jeValideLeFormulaireDeModification(): HTMLElement {
  const form = screen.getByRole('form', { name: 'Modifier une action' })
  const button = within(form).getByRole('button', { name: 'Valider et envoyer' })
  fireEvent.click(button)
  return button
}

function jeTapeLeContexteDeLaction(formulaire: HTMLElement): void {
  const noteDeContexte = within(formulaire).getByRole('textarea', { name: 'Éditeur de contexte de l‘action' })
  fireEvent.input(noteDeContexte, { target: { innerHTML: '<p>Ma note de contexte de l‘action</p>' } })
}

function jeTapeLeNomDeLAction(formulaire: HTMLElement): void {
  const nomDeLAction = within(formulaire).getByRole('textbox', { name: 'Nom de l‘action *' })
  fireEvent.change(nomDeLAction, { target: { value: 'Structurer une filière de reconditionnement locale 1' } })
}

function jeTapeLaDescriptionDeLaction(formulaire: HTMLElement): void {
  const description = within(formulaire).getByRole('textarea', { name: 'Éditeur de description de l‘action' })
  fireEvent.input(description, { target: { innerHTML: '<p>Mes notes de description de l‘action</p>' } })
}
