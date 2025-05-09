import { fireEvent, screen, within } from '@testing-library/react'
import userEvent, { UserEvent } from '@testing-library/user-event'

import {
  afficherFormulaireDeCreationAction,
  afficherFormulaireDeModificationAction,
  jeSelectionneUnCofinancementDansLeDrawerAsync,
  jeSelectionneUnMontatnDansLeDrawerAsync,
  jeTapeLeBudgetGlobalDeLAction,
  jeTapeLeBudgetGlobalDeLActionAsync,
  jOuvreLeFormulairePourAjouterUnCoFinancement,
  jOuvreLeFormulairePourAjouterUnCoFinancementAsync,
} from './Action.test'

let user: UserEvent

describe('drawer d‘ajout d‘un co-financement', () => {
  beforeEach(() => {
    user = userEvent.setup()
  })

  it('étant un utilisateur, lorsque je clique sur le bouton ajouter un financement, alors le drawer s‘ouvre', () => {
    // GIVEN
    afficherFormulaireDeCreationAction(undefined, {
      porteursPotentielsNouvellesFeuillesDeRouteOuActions : [
        { nom: 'CC des Monts du Lyonnais',roles : [], uid: 'CC_des_monts_id' },
        { nom: 'Croix Rouge Française',roles : [], uid: 'croix_rouge_id' },
        { nom: 'La Poste',roles : [], uid: 'la_poste_id' },
      ],
    })

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourAjouterUnCoFinancement(formulaire)
    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    expect(drawer).toBeInTheDocument()
    const titre = within(drawer).getByRole('heading', { level: 1, name: 'Ajouter un co-financement' })
    expect(titre).toBeInTheDocument()
    const texteDInstruction = within(drawer).getByText('Précisez l‘origine du financement', { selector: 'p' })
    expect(texteDInstruction).toBeInTheDocument()
    const selecteurOrigineDuFinancement = within(drawer).getByRole('combobox', { name: 'Membre de la gouvernance' })
    const option1 = within(selecteurOrigineDuFinancement).getByRole('option', { hidden: true, name: '' })
    expect(option1).toBeInTheDocument()
    const option2 = within(selecteurOrigineDuFinancement).getByRole('option', { name: 'CC des Monts du Lyonnais', selected: false })
    expect(option2).toBeInTheDocument()
    const option3 = within(selecteurOrigineDuFinancement).getByRole('option', { name: 'Croix Rouge Française', selected: false })
    expect(option3).toBeInTheDocument()
    const option4 = within(selecteurOrigineDuFinancement).getByRole('option', { name: 'La Poste', selected: false })
    expect(option4).toBeInTheDocument()
    const montantDuFinancement = within(drawer).getByRole('textbox', { name: /Montant du financement */i })
    expect(montantDuFinancement).toBeRequired()
    expect(montantDuFinancement).toHaveAttribute('type', 'text')
    const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
    expect(boutonEnregistrer).toBeDisabled()
  })

  it('étant un utilisateur, lorsque je remplis correctement le formulaire d‘ajout d‘un co-financement, alors il est ajouté', async () => {
    // GIVEN
    afficherFormulaireDeCreationAction(undefined, {
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: [{ nom: 'CC des Monts du Lyonnais', roles: [], uid: 'cc_id' }],
    })

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
    await jeTapeLeBudgetGlobalDeLActionAsync(user, formulaire)
    await jOuvreLeFormulairePourAjouterUnCoFinancementAsync(user,formulaire)
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    await jeSelectionneUnCofinancementDansLeDrawerAsync(user, drawer, 'cc_id')
    await jeSelectionneUnMontatnDansLeDrawerAsync(user, drawer, '1000')
    const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
    await user.click(boutonEnregistrer)
    // THEN
    const listeCofinancements = within(formulaire).getAllByRole('listitem')
    expect(listeCofinancements).toHaveLength(1)
    const premierCofinancement = within(listeCofinancements[0]).getByText('CC des Monts du Lyonnais')
    expect(premierCofinancement).toBeInTheDocument()
    const montantPremierCofinancement = within(listeCofinancements[0]).getByText('1000')
    expect(montantPremierCofinancement).toBeInTheDocument()
  })

  it('étant un utilisateur, lorsque je remplis correctement le formulaire de modification d‘un co-financement, alors il est ajouté', async () => {
    // GIVEN
    afficherFormulaireDeModificationAction(undefined, {
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: [
        { nom : 'CC des Monts du Lyonnais',roles: [], uid : 'cc-id' },
      ],
    } )

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourModifierUnCoFinancement()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    await jeSelectionneUnCofinancementDansLeDrawerAsync(user, drawer, 'cc-id')
    await jeSelectionneUnMontatnDansLeDrawerAsync(user, drawer, '1000')

    const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
    expect(boutonEnregistrer).toBeEnabled()
    fireEvent.click(boutonEnregistrer)

    // THEN
    const listeCofinancements = within(formulaire).getAllByRole('listitem')
    expect(listeCofinancements).toHaveLength(5)
    const cinquiemeCofinancement = within(listeCofinancements[4]).getByText('CC des Monts du Lyonnais')
    expect(cinquiemeCofinancement).toBeInTheDocument()
    const montantCinquiemeCofinancement = within(listeCofinancements[4]).getByText('1000 €')
    expect(montantCinquiemeCofinancement).toBeInTheDocument()
  })

  it('lorque je clique sur le bouton fermer du drawer d‘ajout d‘un co-financement, dans le formulaire d‘ajout d‘une action, alors le drawer se ferme', async () => {
    // GIVEN
    afficherFormulaireDeCreationAction()

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
    await jeTapeLeBudgetGlobalDeLActionAsync(user, formulaire)
    await jOuvreLeFormulairePourAjouterUnCoFinancementAsync(user, formulaire)
    const drawer = screen.getByRole('dialog', { name: 'Ajouter un co-financement' })
    const boutonFermer = within(drawer).getByRole('button', { name: 'Fermer' })
    await user.click(boutonFermer)
    // THEN
    expect(drawer).not.toBeVisible()
  })
})

function jOuvreLeFormulairePourModifierUnCoFinancement(): void {
  const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
  const boutonAjouterUnCoFinanacement = within(formulaire).getByRole('button', { name: 'Ajouter un financement' })
  fireEvent.click(boutonAjouterUnCoFinanacement)
}
