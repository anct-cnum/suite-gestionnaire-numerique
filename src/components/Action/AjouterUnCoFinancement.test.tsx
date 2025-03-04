import { fireEvent, screen, within } from '@testing-library/react'

import { afficherFormulaireDeCreationAction, afficherFormulaireDeModificationAction, jeCreeUnCofinancementDansLeDrawer, jeTapeLeBudgetGlobalDeLAction, jOuvreLeFormulairePourAjouterUnCoFinancement } from './Action.test'

describe('drawer d‘ajout d‘un co-financement', () => {
  it('étant un utilisateur, lorsque je clique sur le bouton ajouter un financement, alors le drawer s‘ouvre', () => {
    // GIVEN
    afficherFormulaireDeCreationAction()

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourAjouterUnCoFinancement()

    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    expect(drawer).toBeInTheDocument()
    const titre = within(drawer).getByRole('heading', { level: 1, name: 'Ajouter un co-financement' })
    expect(titre).toBeInTheDocument()
    const texteDInstruction = within(drawer).getByText('Précisez l‘origine du financement', { selector: 'p' })
    expect(texteDInstruction).toBeInTheDocument()
    const selecteurOrigineDuFinancement = within(drawer).getByRole('combobox', { name: 'Membre de la gouvernance' })
    expect(selecteurOrigineDuFinancement).toBeRequired()
    const option1 = within(selecteurOrigineDuFinancement).getByRole('option', { hidden: true, name: '' })
    expect(option1).toBeInTheDocument()
    const option2 = within(selecteurOrigineDuFinancement).getByRole('option', { name: 'CC des Monts du Lyonnais', selected: false })
    expect(option2).toBeInTheDocument()
    const option3 = within(selecteurOrigineDuFinancement).getByRole('option', { name: 'Croix Rouge Française', selected: false })
    expect(option3).toBeInTheDocument()
    const option4 = within(selecteurOrigineDuFinancement).getByRole('option', { name: 'La Poste', selected: false })
    expect(option4).toBeInTheDocument()
    const labelRechercheStructure = within(drawer).getByLabelText('Ou rechercher une autre structure')
    expect(labelRechercheStructure).toBeInTheDocument()
    const champRechercheStructure = within(drawer).getByRole('textbox', { name: 'Ou rechercher une autre structure' })
    expect(champRechercheStructure).not.toBeRequired()
    expect(champRechercheStructure).toHaveAttribute('type', 'text')
    expect(champRechercheStructure).toHaveAttribute('placeholder', 'Numéro SIRET/RIDET, Nom, ...')
    const boutonRechercher = within(drawer).getByRole('button', { name: 'Rechercher' })
    expect(boutonRechercher).toBeEnabled()
    expect(boutonRechercher).toHaveAttribute('type', 'submit')
    const montantDuFinancement = within(drawer).getByRole('spinbutton', { name: 'Montant du financement *' })
    expect(montantDuFinancement).toBeRequired()
    expect(montantDuFinancement).toHaveAttribute('type', 'number')
    expect(montantDuFinancement).toHaveAttribute('min', '0')
    expect(montantDuFinancement).toHaveAttribute('placeholder', '5 000')
    const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
    expect(boutonEnregistrer).toBeDisabled()
  })

  it('étant un utilisateur, lorsque je remplis correctement le formulaire d‘ajout d‘un co-financement, alors il est ajouté', async () => {
    // GIVEN
    afficherFormulaireDeCreationAction()

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourAjouterUnCoFinancement()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    jeCreeUnCofinancementDansLeDrawer(drawer)
    const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
    fireEvent.submit(boutonEnregistrer)

    // THEN
    const listeCofinancements = await within(formulaire).findAllByRole('listitem')
    expect(listeCofinancements).toHaveLength(1)
    const premierCofinancement = within(listeCofinancements[0]).getByText('CC des Monts du Lyonnais')
    expect(premierCofinancement).toBeInTheDocument()
    const montantPremierCofinancement = within(listeCofinancements[0]).getByText('1000 €')
    expect(montantPremierCofinancement).toBeInTheDocument()
  })

  it('étant un utilisateur, lorsque je remplis correctement le formulaire de modification d‘un co-financement, alors il est ajouté', async () => {
    // GIVEN
    afficherFormulaireDeModificationAction()

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourModifierUnCoFinancement()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    jeCreeUnCofinancementDansLeDrawer(drawer)
    const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
    fireEvent.submit(boutonEnregistrer)

    // THEN
    const listeCofinancements = await within(formulaire).findAllByRole('listitem')
    expect(listeCofinancements).toHaveLength(5)
    const cinquiemeCofinancement = within(listeCofinancements[4]).getByText('CC des Monts du Lyonnais')
    expect(cinquiemeCofinancement).toBeInTheDocument()
    const montantCinquiemeCofinancement = within(listeCofinancements[4]).getByText('1000 €')
    expect(montantCinquiemeCofinancement).toBeInTheDocument()
  })

  it('lorque je clique sur le bouton fermer du drawer d‘ajout d‘un co-financement, dans le formulaire d‘ajout d‘une action, alors le drawer se ferme', () => {
    // GIVEN
    afficherFormulaireDeCreationAction()

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourAjouterUnCoFinancement()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    const boutonFermer = within(drawer).getByRole('button', { name: 'Fermer' })
    fireEvent.click(boutonFermer)

    // THEN
    expect(drawer).not.toBeVisible()
  })

  it('lorque je clique sur le bouton fermer du drawer d‘ajout d‘un co-financement, dans le formulaire de modification d‘une action, alors le drawer se ferme', () => {
    // GIVEN
    afficherFormulaireDeModificationAction()

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourModifierUnCoFinancement()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    const boutonFermer = within(drawer).getByRole('button', { name: 'Fermer' })
    fireEvent.click(boutonFermer)

    // THEN
    expect(drawer).not.toBeVisible()
  })
})

function jOuvreLeFormulairePourModifierUnCoFinancement(): void {
  const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
  const boutonAjouterUnCoFinanacement = within(formulaire).getByRole('button', { name: 'Ajouter un financement' })
  fireEvent.click(boutonAjouterUnCoFinanacement)
}
