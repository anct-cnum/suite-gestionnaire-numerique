import { fireEvent, within, screen } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { FrozenDate, matchWithoutMarkup, renderComponent, stubbedConceal } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('comitologie', () => {
  it('quand je clique sur ajouter une comitologie, le drawer d’ajout de comitologie s’affiche', () => {
    // GIVEN
    vi.stubGlobal('Date', FrozenDate)
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    renderComponent(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    cliquerSurAjouterUnComite()

    // THEN
    const ajouterUnComiteDrawer = screen.getByRole('dialog', { name: 'Ajouter un comité' })
    expect(ajouterUnComiteDrawer).toHaveAttribute('aria-labelledby', 'drawer-comite-titre')
    expect(ajouterUnComiteDrawer).toHaveAttribute('aria-modal', 'true')
    expect(ajouterUnComiteDrawer).toHaveAttribute('id', 'drawer-comite')
    expect(ajouterUnComiteDrawer).toHaveAttribute('open')
    const formulaire = screen.getByRole('form', { name: 'Ajouter un comité' })
    const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Ajouter un comité' })
    expect(titre).toBeInTheDocument()
    const sousTitre = within(formulaire).getByText('Renseignez les comités prévus et la fréquence à laquelle ils se réunissent', { selector: 'p' })
    expect(sousTitre).toBeInTheDocument()

    const fieldsets = within(formulaire).getAllByRole('group')
    const typeComiteQuestion = within(fieldsets[0]).getByText(matchWithoutMarkup('Quel type de comité allez-vous organiser ? *'), { selector: 'legend' })
    expect(typeComiteQuestion).toBeInTheDocument()
    const strategique = within(fieldsets[0]).getByLabelText('Stratégique')
    expect(strategique).toHaveAttribute('value', 'strategique')
    expect(strategique).toHaveAttribute('type', 'radio')
    expect(strategique).toBeChecked()
    const technique = within(fieldsets[0]).getByLabelText('Technique')
    expect(technique).toHaveAttribute('value', 'technique')
    expect(technique).toHaveAttribute('type', 'radio')
    expect(technique).not.toBeChecked()
    const consultatif = within(fieldsets[0]).getByLabelText('Consultatif')
    expect(consultatif).toHaveAttribute('value', 'consultatif')
    expect(consultatif).toHaveAttribute('type', 'radio')
    expect(consultatif).not.toBeChecked()
    const autre = within(fieldsets[0]).getByLabelText('Autre')
    expect(autre).toHaveAttribute('value', 'autre')
    expect(autre).toHaveAttribute('type', 'radio')
    expect(autre).not.toBeChecked()

    const frequenceComiteQuestion = within(fieldsets[1]).getByText(matchWithoutMarkup('À quelle fréquence se réunit le comité ? *'), { selector: 'legend' })
    expect(frequenceComiteQuestion).toBeInTheDocument()
    const mensuelle = within(fieldsets[1]).getByLabelText('Mensuelle')
    expect(mensuelle).toHaveAttribute('value', 'mensuelle')
    expect(mensuelle).toHaveAttribute('type', 'radio')
    expect(mensuelle).toBeChecked()
    const trimestrielle = within(fieldsets[1]).getByLabelText('Trimestrielle')
    expect(trimestrielle).toHaveAttribute('value', 'trimestrielle')
    expect(trimestrielle).toHaveAttribute('type', 'radio')
    expect(trimestrielle).not.toBeChecked()
    const semestrielle = within(fieldsets[1]).getByLabelText('Semestrielle')
    expect(semestrielle).toHaveAttribute('value', 'semestrielle')
    expect(semestrielle).toHaveAttribute('type', 'radio')
    expect(semestrielle).not.toBeChecked()
    const annuelle = within(fieldsets[1]).getByLabelText('Annuelle')
    expect(annuelle).toHaveAttribute('value', 'annuelle')
    expect(annuelle).toHaveAttribute('type', 'radio')
    expect(annuelle).not.toBeChecked()

    const dateProchainComite = within(formulaire).getByLabelText('Date du prochain comité')
    expect(dateProchainComite).not.toHaveAttribute('required')
    expect(dateProchainComite).toHaveAttribute('type', 'date')
    expect(dateProchainComite).toHaveAttribute('min', '1996-04-15')

    const commentaires = within(formulaire).getByLabelText('Laissez ici un commentaire général sur le comité', { selector: 'textarea' })
    expect(commentaires).not.toHaveAttribute('required')
    expect(commentaires).toHaveAttribute('maxLength', '500')

    const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
    expect(enregistrer).not.toBeDisabled()
  })

  it('quand je remplis correctement le formulaire, alors le drawer se ferme, une notification s’affiche, la gouvernance est mise à jour et le formulaire est réinitialisé', async () => {
    // GIVEN
    vi.stubGlobal('Date', FrozenDate)
    const ajouterUnComiteAction = vi.fn(async () => Promise.resolve(['OK']))
    vi.stubGlobal('dsfr', stubbedConceal())
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    renderComponent(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />, { ajouterUnComiteAction, pathname: '/gouvernance/11' })
    cliquerSurAjouterUnComite()

    // WHEN
    cliquerSurUnType('Technique')
    cliquerSurUneFrequence('Annuelle')
    const date = choisirUneDate('1996-04-15')
    const commentaire = ecrireUnCommentaire('commentaire')
    const enregistrer = validerLeFormulaire()

    // THEN
    expect(enregistrer).toHaveAccessibleName('Ajout en cours...')
    expect(enregistrer).toBeDisabled()
    const formulaire = await screen.findByRole('form', { name: 'Ajouter un comité' })
    expect(formulaire).not.toBeVisible()
    const strategique = screen.getByLabelText('Stratégique')
    expect(strategique).toBeChecked()
    const mensuelle = screen.getByLabelText('Mensuelle')
    expect(mensuelle).toBeChecked()
    expect(date).toHaveValue('')
    expect(commentaire).toHaveValue('')
    expect(ajouterUnComiteAction).toHaveBeenCalledWith({
      commentaire: 'commentaire',
      date: '1996-04-15',
      frequence: 'annuelle',
      path: '/gouvernance/11',
      type: 'technique',
      uidGouvernance: 'gouvernanceFooId',
    })
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Comité bien ajouté')
    expect(enregistrer).toHaveAccessibleName('Enregistrer')
    expect(enregistrer).not.toBeDisabled()
  })

  it('quand je remplis correctement le formulaire mais qu’une erreur intervient, alors une notification apparaît', async () => {
    // GIVEN
    const ajouterUnComiteAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
    vi.stubGlobal('dsfr', stubbedConceal())

    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    renderComponent(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />, { ajouterUnComiteAction, pathname: '/gouvernance/11' })
    cliquerSurAjouterUnComite()

    // WHEN
    validerLeFormulaire()

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
  })
})

function cliquerSurAjouterUnComite(): void {
  const comitologie = screen.getByRole('region', { name: 'Comitologie' })
  const ajouter = within(comitologie).getByRole('button', { name: 'Ajouter' })
  fireEvent.click(ajouter)
}

function cliquerSurUnType(label: string): void {
  const technique = screen.getByLabelText(label)
  fireEvent.click(technique)
}

function cliquerSurUneFrequence(label: string): void {
  const annuelle = screen.getByLabelText(label)
  fireEvent.click(annuelle)
}

function choisirUneDate(value: string): HTMLElement {
  const date = screen.getByLabelText('Date du prochain comité')
  fireEvent.change(date, { target: { value } })
  return date
}

function ecrireUnCommentaire(value: string): HTMLElement {
  const commentaire = screen.getByLabelText('Laissez ici un commentaire général sur le comité')
  fireEvent.change(commentaire, { target: { value } })
  return commentaire
}

function validerLeFormulaire(): HTMLElement {
  const enregistrer = screen.getByRole('button', { name: 'Enregistrer' })
  fireEvent.click(enregistrer)
  return enregistrer
}
