import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  afficherFormulaireDeCreationAction,
  afficherFormulaireDeModificationAction,
  jeCreeUnCofinancementDansLeDrawer,
  jeTapeLeBudgetGlobalDeLAction,
  jOuvreLeFormulairePourAjouterUnCoFinancement,
} from './Action.test'

describe('drawer d‘ajout d‘un co-financement', () => {
  it('étant un utilisateur, lorsque je clique sur le bouton ajouter un financement, alors le drawer s‘ouvre', async () => {
    // GIVEN
    afficherFormulaireDeCreationAction(undefined, {
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: [
        { nom: 'CC des Monts du Lyonnais', roles: [], structureId: 200, uid: 'cc_id' },
        { nom: 'Croix Rouge Française', roles: [], structureId: 203, uid: 'croix_id' },
        { nom: 'La Poste', roles: [], structureId: 300, uid: 'post_id' },
      ],
    })

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourAjouterUnCoFinancement()

    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    expect(drawer).toBeInTheDocument()
    const titre = within(drawer).getByRole('heading', { level: 3, name: 'Ajouter un co-financement' })
    expect(titre).toBeInTheDocument()
    const texteDInstruction = within(drawer).getByText('Précisez l’origine du financement', { selector: 'p' })
    expect(texteDInstruction).toBeInTheDocument()
    const selecteurOrigineDuFinancement = within(drawer).getByRole('combobox', { name: 'Membre de la gouvernance' })
    await userEvent.click(selecteurOrigineDuFinancement)
    const option1 = await within(drawer).findByRole('option', { name: 'CC des Monts du Lyonnais' })
    expect(option1).toBeInTheDocument()
    const option2 = within(drawer).getByRole('option', { name: 'Croix Rouge Française' })
    expect(option2).toBeInTheDocument()
    const option3 = within(drawer).getByRole('option', { name: 'La Poste' })
    expect(option3).toBeInTheDocument()
    const montantDuFinancement = within(drawer).getByRole('textbox', { name: 'Montant du financement *' })
    expect(montantDuFinancement).toBeRequired()
    expect(montantDuFinancement).toHaveAttribute('type', 'text')
    const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
    expect(boutonEnregistrer).toBeDisabled()
  })

  it('étant un utilisateur, lorsque je remplis correctement le formulaire d‘ajout d‘un co-financement, alors il est ajouté', async () => {
    // GIVEN
    afficherFormulaireDeCreationAction(undefined, {
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: [
        { nom: 'CC des Monts du Lyonnais', roles: [], structureId: 200, uid: 'cc_id' },
      ],
    })

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Ajouter une action à la feuille de route' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourAjouterUnCoFinancement()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    await jeCreeUnCofinancementDansLeDrawer(drawer)
    const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
    fireEvent.click(boutonEnregistrer)

    // THEN
    const listeCofinancements = await within(formulaire).findAllByRole('listitem')
    expect(listeCofinancements).toHaveLength(1)
    const premierCofinancement = within(listeCofinancements[0]).getByText('CC des Monts du Lyonnais')
    expect(premierCofinancement).toBeInTheDocument()
    const montantPremierCofinancement = within(listeCofinancements[0]).getByText('1 000 €')
    expect(montantPremierCofinancement).toBeInTheDocument()
  })

  it('étant un utilisateur, lorsque je remplis correctement le formulaire de modification d‘un co-financement, alors il est ajouté', async () => {
    // GIVEN
    afficherFormulaireDeModificationAction(undefined, {
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: [
        { nom: 'CC des Monts du Lyonnais', roles: [], structureId: 200, uid: 'cc_id' },
      ],
    })

    // WHEN
    const formulaire = screen.getByRole('form', { name: 'Modifier une action' })
    jeTapeLeBudgetGlobalDeLAction(formulaire)
    jOuvreLeFormulairePourModifierUnCoFinancement()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un co-financement' })
    await jeCreeUnCofinancementDansLeDrawer(drawer)
    const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
    fireEvent.click(boutonEnregistrer)
    // THEN
    const listeCofinancements = await within(formulaire).findAllByRole('listitem')
    expect(listeCofinancements).toHaveLength(5)
    const cinquiemeCofinancement = within(listeCofinancements[4]).getByText('CC des Monts du Lyonnais')
    expect(cinquiemeCofinancement).toBeInTheDocument()
    const montantCinquiemeCofinancement = within(listeCofinancements[4]).getByText('1 000 €')
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
