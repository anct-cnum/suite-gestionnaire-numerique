import { fireEvent, render, within, screen } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('comitologie', () => {
  it('quand je clique sur ajouter dans une comitologie, le drawer d’ajout de comitologie s’affiche', () => {
    // GIVEN
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 11, 12, 13))
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
    expect(strategique).toHaveAttribute('value', 'strategique')
    const technique = within(ajouterUnComiteDrawer).getByLabelText('Technique')
    expect(technique).toHaveAttribute('value', 'technique')
    const consultatif = within(ajouterUnComiteDrawer).getByLabelText('Consultatif')
    expect(consultatif).toHaveAttribute('value', 'consultatif')
    const autre = within(ajouterUnComiteDrawer).getByLabelText('Autre')
    expect(autre).toHaveAttribute('value', 'autre')
    const frequenceComiteQuestion = within(ajouterUnComiteDrawer).getByText('A quelle fréquence se réunit le comité ?', { selector: 'p' })
    expect(frequenceComiteQuestion).toBeInTheDocument()
    const mensuelle = within(ajouterUnComiteDrawer).getByLabelText('Mensuelle')
    expect(mensuelle).toHaveAttribute('value', 'mensuelle')
    const trimestrielle = within(ajouterUnComiteDrawer).getByLabelText('Trimestrielle')
    expect(trimestrielle).toHaveAttribute('value', 'trimestrielle')
    const semestrielle = within(ajouterUnComiteDrawer).getByLabelText('Semestrielle')
    expect(semestrielle).toHaveAttribute('value', 'semestrielle')
    const annuelle = within(ajouterUnComiteDrawer).getByLabelText('Annuelle')
    expect(annuelle).toHaveAttribute('value', 'annuelle')
    const dateProchainComite = within(ajouterUnComiteDrawer).getByLabelText('Date du prochain comité')
    expect(dateProchainComite).toHaveAttribute('type', 'date')
    expect(dateProchainComite).not.toHaveAttribute('required')
    expect(dateProchainComite).toHaveAttribute('min', '2024-12-12')
    const commentaires = within(ajouterUnComiteDrawer).getByLabelText('Laissez ici un commentaire général sur le comité')
    expect(commentaires).toHaveAttribute('maxLength', '500')
    expect(commentaires).not.toHaveAttribute('required')
    const enregistrer = within(ajouterUnComiteDrawer).getByRole('button', { name: 'Enregistrer' })
    expect(enregistrer).toHaveAttribute('disabled')

    vi.useRealTimers()
  })

  it('quand je remplis les champs obligatoires du formulaire d’ajout de comitologie, alors le bouton de validation devient cliquable', () => {
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
    const strategique = within(ajouterUnComiteDrawer).getByLabelText('Stratégique')
    fireEvent.click(strategique)
    const mensuelle = within(ajouterUnComiteDrawer).getByLabelText('Mensuelle')
    fireEvent.click(mensuelle)

    // THEN
    expect(enregistrer).not.toHaveAttribute('disabled')
  })

  it('quand je ne remplis pas les champs obligatoires du formulaire d’ajout de comitologie, alors le bouton de validation n’est pas cliquable', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())

    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)
    const comitologie = screen.getByRole('region', { name: 'Comitologie' })
    const ajouter = within(comitologie).getByRole('button', { name: 'Ajouter' })
    fireEvent.click(ajouter)

    // WHEN
    const ajouterUnComiteDrawer = screen.getByRole('dialog')
    const strategique = within(ajouterUnComiteDrawer).getByLabelText('Stratégique')
    fireEvent.click(strategique)

    // THEN
    const enregistrer = within(ajouterUnComiteDrawer).getByRole('button', { name: 'Enregistrer' })
    expect(enregistrer).toHaveAttribute('disabled')
  })
})