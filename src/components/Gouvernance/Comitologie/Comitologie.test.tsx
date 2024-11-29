import { fireEvent, render, within, screen } from '@testing-library/react'

import { gouvernancePresenter } from '../../../presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '../../../use-cases/testHelper'
import Gouvernance from '../Gouvernance'

describe('comitologie', () => {
  it('quand je clique sur ajouter dans une comitologie, le drawer d’ajout de comitologie s’affiche', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())

    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)
    const comitologie = screen.getByRole('region', { name: 'Comitologie' })
    const ajouter = within(comitologie).getByRole('button', { name: 'Ajouter' })

    // WHEN
    fireEvent.click(ajouter)

    // THEN
    const ajouterUnComiteDrawer = screen.getByRole('dialog')
    expect(ajouterUnComiteDrawer).toHaveAttribute('aria-labelledby', 'drawer-comite-titre')
    expect(ajouterUnComiteDrawer).toHaveAttribute('aria-modal', 'true')
    expect(ajouterUnComiteDrawer).toHaveAttribute('id', 'drawer-comite')
    expect(ajouterUnComiteDrawer).toHaveAttribute('open')
    const boutonFermer = within(ajouterUnComiteDrawer).getByRole('button', { name: 'Fermer' })
    expect(boutonFermer).toHaveAttribute('type', 'button')
    const ajouterUnComite = within(ajouterUnComiteDrawer).getByRole('heading', { level: 1, name: 'Ajouter un comité' })
    expect(ajouterUnComite).toBeInTheDocument()
    const sousTitreAjouterUnComite = within(ajouterUnComiteDrawer).getByText('Renseignez les comités prévus et la fréquence à laquelle ils se réunissent', { selector: 'p' })
    expect(sousTitreAjouterUnComite).toBeInTheDocument()
    const typeComiteQuestion = within(ajouterUnComiteDrawer).getByText('Quel type de comité allez-vous organiser ?', { selector: 'p' })
    expect(typeComiteQuestion).toBeInTheDocument()
    const strategique = within(ajouterUnComiteDrawer).getByLabelText('Stratégique')
    expect(strategique).toBeInTheDocument()
    const technique = within(ajouterUnComiteDrawer).getByLabelText('Technique')
    expect(technique).toBeInTheDocument()
    const consultatif = within(ajouterUnComiteDrawer).getByLabelText('Consultatif')
    expect(consultatif).toBeInTheDocument()
    const autre = within(ajouterUnComiteDrawer).getByLabelText('Autre')
    expect(autre).toBeInTheDocument()
    const frequenceComiteQuestion = within(ajouterUnComiteDrawer).getByText('A quelle fréquence se réunit le comité ?', { selector: 'p' })
    expect(frequenceComiteQuestion).toBeInTheDocument()
    const mensuelle = within(ajouterUnComiteDrawer).getByLabelText('Mensuelle')
    expect(mensuelle).toBeInTheDocument()
    const trimestrielle = within(ajouterUnComiteDrawer).getByLabelText('Trimestrielle')
    expect(trimestrielle).toBeInTheDocument()
    const semestrielle = within(ajouterUnComiteDrawer).getByLabelText('Semestrielle')
    expect(semestrielle).toBeInTheDocument()
    const annuelle = within(ajouterUnComiteDrawer).getByLabelText('Annuelle')
    expect(annuelle).toBeInTheDocument()
    const dateProchainComite = within(ajouterUnComiteDrawer).getByLabelText('Date du prochain comité')
    expect(dateProchainComite).toBeInTheDocument()
    const commentaires = within(ajouterUnComiteDrawer).getByLabelText('Laissez ici un commentaire général sur le comité')
    expect(commentaires).toBeInTheDocument()
    const enregistrer = within(ajouterUnComiteDrawer).getByRole('button', { name: 'Enregistrer' })
    expect(enregistrer).toBeInTheDocument()
  })

  it('quand je remplis entièrement le formulaire d’ajout de comitologie, le bouton de validation devient cliquable', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())

    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)
    const comitologie = screen.getByRole('region', { name: 'Comitologie' })
    const ajouter = within(comitologie).getByRole('button', { name: 'Ajouter' })
    fireEvent.click(ajouter)

    // WHEN
    const ajouterUnComiteDrawer = screen.getByRole('dialog')
    const enregistrer = within(ajouterUnComiteDrawer).getByRole('button', { name: 'Enregistrer' })
    expect(enregistrer).toHaveAttribute('disabled')
    const dateProchainComite = within(ajouterUnComiteDrawer).getByLabelText('Date du prochain comité')
    fireEvent.change(dateProchainComite, { target: { value: '2034-01-01' } })
    const commentaires = within(ajouterUnComiteDrawer).getByLabelText('Laissez ici un commentaire général sur le comité')
    fireEvent.change(commentaires, { target: { value: 'commentaire' } })
    const strategique = within(ajouterUnComiteDrawer).getByLabelText('Stratégique')
    fireEvent.click(strategique)
    const mensuelle = within(ajouterUnComiteDrawer).getByLabelText('Mensuelle')
    fireEvent.click(mensuelle)

    // THEN
    expect(enregistrer).not.toHaveAttribute('disabled')
  })
})
