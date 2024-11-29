import { fireEvent, render, within, screen } from '@testing-library/react'

import { gouvernancePresenter } from '../../../presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '../../../use-cases/testHelper'
import Gouvernance from '../Gouvernance'

describe('comitologie', () => {
  it('quand je clique sur ajouter dans une comitologie, le drawer d’ajout de comitologie s’affiche', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      comites: [
        {
          dateProchainComite: new Date('2024-09-06'),
          nom: 'Comité stratégique 1',
          periodicite: 'Semestriel',
        },
      ],
    }))

    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)
    const comitologie = screen.getByRole('region', { name: 'Comitologie' })
    const ajouter = within(comitologie).getByRole('button', { name: 'Ajouter' })

    // WHEN
    fireEvent.click(ajouter)

    // THEN
    const ajouterUnComite = screen.getByRole('heading', { level: 1, name: 'Ajouter un comité' })
    expect(ajouterUnComite).toBeInTheDocument()
    const sousTitreAjouterUnComite = screen.getByText('Renseignez les comités prévus et la fréquence à laquelle ils se réunissent', { selector: 'p' })
    expect(sousTitreAjouterUnComite).toBeInTheDocument()
    const typeComiteQuestion = screen.getByText('Quel type de comité allez-vous organiser ?', { selector: 'p' })
    expect(typeComiteQuestion).toBeInTheDocument()
    const strategique = screen.getByLabelText('Stratégique')
    expect(strategique).toBeInTheDocument()
    const technique = screen.getByLabelText('Technique')
    expect(technique).toBeInTheDocument()
    const consultatif = screen.getByLabelText('Consultatif')
    expect(consultatif).toBeInTheDocument()
    const autre = screen.getByLabelText('Autre')
    expect(autre).toBeInTheDocument()
    const frequenceComiteQuestion = screen.getByText('A quelle fréquence se réunit le comité ?', { selector: 'p' })
    expect(frequenceComiteQuestion).toBeInTheDocument()
    const mensuelle = screen.getByLabelText('Mensuelle')
    expect(mensuelle).toBeInTheDocument()
    const trimestrielle = screen.getByLabelText('Trimestrielle')
    expect(trimestrielle).toBeInTheDocument()
    const semestrielle = screen.getByLabelText('Semestrielle')
    expect(semestrielle).toBeInTheDocument()
    const annuelle = screen.getByLabelText('Annuelle')
    expect(annuelle).toBeInTheDocument()
  })
})
