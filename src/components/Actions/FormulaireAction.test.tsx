import { fireEvent, screen, within } from '@testing-library/react'

import { matchWithoutMarkup, renderComponent } from '../testHelper'
import { FormulaireAction } from './FormulaireAction'
import MenuLateral from './MenuLateral'
import { epochTime } from '@/shared/testHelper'

const mockRichTextEditor = {
  contenu: '',
  gererLeChangementDeContenu: vi.fn().mockImplementation((content: string): void => {
    mockRichTextEditor.contenu = content
  }),
  viderLeContenu: vi.fn(),
}

vi.mock('@/components/shared/RichTextEditor/hooks/useRichTextEditor', () => ({
  useRichTextEditor: (): typeof mockRichTextEditor => mockRichTextEditor,
}))

describe('formulaire d‘ajout d‘une action', () => {
  describe('menu latéral', () => {
    it.each([
      { lien: 'besoinsAction', titre: 'Besoins liés à l‘action' },
      { lien: 'informationsAction', titre: 'Informations sur l‘action' },
      { lien: 'porteurAction', titre: 'Porteur de l‘action' },
      { lien: 'temporaliteAction', titre: 'Temporalité de l‘action' },
      { lien: 'budgetAction', titre: 'Information sur le budget et le financement' },
      { lien: 'destinatairesFonds', titre: 'Destinataire(s) des fonds' },
    ])('étant un utilisateur, lorsque je veux ajouter une action, alors je vois le menu latéral avec le lien %s', ({ titre, lien }) => {
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
    beforeEach(() => {
      vi.resetAllMocks()
      vi.resetModules()
      mockRichTextEditor.contenu = ''
    })
    it('étant un utilisateur,lorsque je veux ajouter une action, alors je vois le formulaire d‘ajout d‘une action', () => {
    // WHEN
      mockRichTextEditor.contenu = '<p>Ma note de contexte</p>'
      afficherFormulaireDeCreationAction()

      // THEN
      const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
      const lienVersLaFeuilleDeRoute = within(formulaire).getByRole('link', { name: 'Feuille de route 69' })
      expect(lienVersLaFeuilleDeRoute).toBeInTheDocument()
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Ajouter une action à la feuille de route' })
      expect(titre).toBeInTheDocument()
      const badgeEnConstruction = within(formulaire).getByText('En construction', { selector: 'p' })
      expect(badgeEnConstruction).toBeInTheDocument()
      const titreIndicationDuBesoin = within(formulaire).getByText(matchWithoutMarkup('Besoins liés à l‘action *'), { selector: 'p' })
      expect(titreIndicationDuBesoin).toBeInTheDocument()
      const boutonModifier = within(formulaire).getAllByRole('button', { name: 'Modifier' })[0]
      expect(boutonModifier).toBeInTheDocument()
      const texteIndicationDuBesoin = within(formulaire).getByText('Indiquez à quel besoins se rapporte l’action pour laquelle vous demandez une subvention. Si vos besoins ont changé depuis leur première expression dans le formulaire de janvier 2024 vous pouvez tout à fait sélectionner une autre catégorie de besoin.', { selector: 'p' })
      expect(texteIndicationDuBesoin).toBeInTheDocument()
      const tagBesoinParDefaut = within(formulaire).getByText('Établir un diagnostic territorial', { selector: 'p' })
      expect(tagBesoinParDefaut).toBeInTheDocument()
      const titreSectionInformationSurLAction = within(formulaire).getByText('Informations sur l‘action', { selector: 'p' })
      expect(titreSectionInformationSurLAction).toBeInTheDocument()
      const nomDeLAction = within(formulaire).getByLabelText('Nom de l‘action *')
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
      const labelSectionPorteurDeLAaction = within(formulaire).getByText('Sélectionnez le porteur de l‘action', { selector: 'p' })
      expect(labelSectionPorteurDeLAaction).toBeInTheDocument()
      const boutonModifierLePorteurDeLAaction = within(formulaire).getAllByRole('button', { name: 'Modifier' })[1]
      expect(boutonModifierLePorteurDeLAaction).toBeInTheDocument()
      const tagPorteurDeLAactionParDefaut = within(formulaire).getByRole('link', { name: 'CC des Monts du Lyonnais' })
      expect(tagPorteurDeLAactionParDefaut).toBeInTheDocument()
      const titreSectionTemporaliteDeLAaction = within(formulaire).getByText('Temporalité de l‘action', { selector: 'p' })
      expect(titreSectionTemporaliteDeLAaction).toBeInTheDocument()
      const labelSectionTemporaliteDeLAaction = within(formulaire).getByText('Veuillez indiquer si cette action est annuelle ou pluriannuelle', { selector: 'p' })
      expect(labelSectionTemporaliteDeLAaction).toBeInTheDocument()
      const annuelle = within(formulaire).getByRole('radio', { name: 'Annuelle' })
      expect(annuelle).toHaveAttribute('value', 'annuelle')
      const pluriannuelle = within(formulaire).getByRole('radio', { name: 'Pluriannuelle' })
      expect(pluriannuelle).toHaveAttribute('value', 'pluriannuelle')
      const anneeDeDebut = within(formulaire).getByLabelText('Année de début de l‘action')
      expect(anneeDeDebut).toHaveAttribute('name', 'anneeDeDebut')
      expect(anneeDeDebut).toHaveAttribute('type', 'text')
      const anneeDeFin = within(formulaire).getByLabelText('Année de fin de l‘action')
      expect(anneeDeFin).toHaveAttribute('name', 'anneeDeFin')
      expect(anneeDeFin).toHaveAttribute('type', 'text')
      const titreSectionInformationBudget = within(formulaire).getByText('Information sur le budget et le financement', { selector: 'p' })
      expect(titreSectionInformationBudget).toBeInTheDocument()
      const instructionsInformationBudget = within(formulaire).getByText('Détaillez le budget prévisionnel de l‘action incluant les subventions et les co-financements éventuels des membres ou ...', { selector: 'p' })
      expect(instructionsInformationBudget).toBeInTheDocument()
      const budgetGlobalDeLAction = within(formulaire).getByLabelText('Budget global de l‘action *')
      expect(budgetGlobalDeLAction).toBeRequired()
      expect(budgetGlobalDeLAction).toHaveAttribute('name', 'budgetGlobal')
      expect(budgetGlobalDeLAction).toHaveAttribute('type', 'number')
      expect(budgetGlobalDeLAction).toHaveValue(null)
      const demandeDeSubvention = within(formulaire).getByText('Subvention demandée à l‘état')
      expect(demandeDeSubvention).toBeInTheDocument()
      const boutonDemanderUneSubvention = within(formulaire).getByRole('button', { name: 'Demander une subvention' })
      expect(boutonDemanderUneSubvention).toBeDisabled()
      const coFinancement = within(formulaire).getByText('Co-financement')
      expect(coFinancement).toBeInTheDocument()
      const boutonAjouterUnFinancement = within(formulaire).getByRole('button', { name: 'Ajouter un financement' })
      expect(boutonAjouterUnFinancement).toBeDisabled()
      const titreSectionDestinattairesDesFonds = within(formulaire).getByText(matchWithoutMarkup('Destinataire(s) des fonds *'), { selector: 'p' })
      expect(titreSectionDestinattairesDesFonds).toBeInTheDocument()
      const boutonAjouterUnDestinataire = within(formulaire).getByRole('button', { name: 'Ajouter' })
      expect(boutonAjouterUnDestinataire).toBeInTheDocument()
      const instructionsAjoutDestinaire = within(formulaire).getByText('Précisez le ou les membres de votre gouvernance qui seront destinataires des fonds. Dans le cas où vous renseignez plusieurs destinataires des fonds pour cette action, un encart s’ouvrira vous demandant d’indiquer le montant de la subvention par destinataire.', { selector: 'p' })
      expect(instructionsAjoutDestinaire).toBeInTheDocument()
      const boutonDeValidation = within(formulaire).getByRole('button', { name: 'Valider et envoyer' })
      expect(boutonDeValidation).toBeInTheDocument()
    })

    it('étant un utilisateur,lorsque je veux ajouter une action, l‘option annuelle est sélectionnée par défaut', () => {
      // WHEN
      afficherFormulaireDeCreationAction()

      // THEN
      const optionAnnuelle = screen.getByRole('radio', { name: 'Annuelle' })
      expect(optionAnnuelle).toBeChecked()
      const optionPluriannuelle = screen.getByRole('radio', { name: 'Pluriannuelle' })
      expect(optionPluriannuelle).not.toBeChecked()
    })

    it('étant un utilisateur, lorsque je sélectionne l‘option pluriannuelle, alors cette option est sélectionnée', () => {
      // GIVEN
      afficherFormulaireDeCreationAction()

      // WHEN
      const optionPluriannuelle = screen.getByRole('radio', { name: 'Pluriannuelle' })
      fireEvent.click(optionPluriannuelle)

      // THEN
      expect(optionPluriannuelle).toBeChecked()
      const optionAnnuelle = screen.getByRole('radio', { name: 'Annuelle' })
      expect(optionAnnuelle).not.toBeChecked()
    })

    it('étant un utilisateur, lorsque je selectionne l‘option annuelle, alors cette option est sélectionnée', () => {
      // GIVEN
      afficherFormulaireDeCreationAction()

      // WHEN
      const optionPluriannuelle = screen.getByRole('radio', { name: 'Pluriannuelle' })
      fireEvent.click(optionPluriannuelle)
      const optionAnnuelle = screen.getByRole('radio', { name: 'Annuelle' })
      fireEvent.click(optionAnnuelle)

      // THEN
      expect(optionAnnuelle).toBeChecked()
      expect(optionPluriannuelle).not.toBeChecked()
    })
  })
})

function afficherFormulaireDeCreationAction(): void {
  renderComponent(<FormulaireAction date={epochTime} />)
}

function afficherMenuLateral(): void {
  renderComponent(<MenuLateral />)
}
