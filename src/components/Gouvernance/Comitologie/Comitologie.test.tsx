import { within, screen } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { FrozenDate, presserLeBouton, presserLeBoutonRadio, saisirLeTexte, matchWithoutMarkup, renderComponent, stubbedConceal } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

const now = new Date('2024-09-06')

describe('comitologie', () => {
  it('quand je clique sur ajouter une comitologie, le drawer d’ajout de comitologie s’affiche', () => {
    // GIVEN
    vi.stubGlobal('Date', FrozenDate)
    afficherUneGouvernance()

    // WHEN
    jOuvreLeFormulairePourAjouterUnComite()

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
    const strategique = within(fieldsets[0]).getByRole('radio', { checked: true, name: 'Stratégique' })
    expect(strategique).toHaveAttribute('value', 'strategique')
    const technique = within(fieldsets[0]).getByRole('radio', { checked: false, name: 'Technique' })
    expect(technique).toHaveAttribute('value', 'technique')
    const consultatif = within(fieldsets[0]).getByRole('radio', { checked: false, name: 'Consultatif' })
    expect(consultatif).toHaveAttribute('value', 'consultatif')
    const autre = within(fieldsets[0]).getByRole('radio', { checked: false, name: 'Autre' })
    expect(autre).toHaveAttribute('value', 'autre')

    const frequenceComiteQuestion = within(fieldsets[1]).getByText(matchWithoutMarkup('À quelle fréquence se réunit le comité ? *'), { selector: 'legend' })
    expect(frequenceComiteQuestion).toBeInTheDocument()
    const mensuelle = within(fieldsets[1]).getByRole('radio', { checked: true, name: 'Mensuelle' })
    expect(mensuelle).toHaveAttribute('value', 'mensuelle')
    const trimestrielle = within(fieldsets[1]).getByRole('radio', { checked: false, name: 'Trimestrielle' })
    expect(trimestrielle).toHaveAttribute('value', 'trimestrielle')
    const semestrielle = within(fieldsets[1]).getByRole('radio', { checked: false, name: 'Semestrielle' })
    expect(semestrielle).toHaveAttribute('value', 'semestrielle')
    const annuelle = within(fieldsets[1]).getByRole('radio', { checked: false, name: 'Annuelle' })
    expect(annuelle).toHaveAttribute('value', 'annuelle')

    const date = within(formulaire).getByLabelText('Date du prochain comité')
    expect(date).not.toHaveAttribute('required')
    expect(date).toHaveAttribute('type', 'date')
    expect(date).toHaveAttribute('min', '1996-04-15')

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
    afficherUneGouvernance({ ajouterUnComiteAction, pathname: '/gouvernance/11' })

    // WHEN
    jOuvreLeFormulairePourAjouterUnComite()
    const ajouterUnComiteDrawer = screen.getByRole('dialog', { name: 'Ajouter un comité' })
    jeSelectionneUnType('Technique')
    jeSelectionneUneFrequence('Annuelle')
    const date = jeChoisisUneDate('1996-04-15')
    const commentaire = jeTapeUnCommentaire('commentaire')
    const enregistrer = jEnregistreLeComite()

    // THEN
    expect(enregistrer).toHaveAccessibleName('Ajout en cours...')
    expect(enregistrer).toBeDisabled()
    const strategique = await screen.findByRole('radio', { checked: true, hidden: true, name: 'Stratégique' })
    expect(strategique).toBeInTheDocument()
    const mensuelle = screen.getByRole('radio', { checked: true, hidden: true, name: 'Mensuelle' })
    expect(mensuelle).toBeInTheDocument()
    expect(date).toHaveValue('')
    expect(commentaire).toHaveValue('')
    expect(ajouterUnComiteDrawer).not.toBeVisible()
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
    afficherUneGouvernance({ ajouterUnComiteAction, pathname: '/gouvernance/11' })

    // WHEN
    jOuvreLeFormulairePourAjouterUnComite()
    jEnregistreLeComite()

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
  })

  function jOuvreLeFormulairePourAjouterUnComite(): void {
    presserLeBouton('Ajouter')
  }

  function jeSelectionneUnType(name: string): void {
    presserLeBoutonRadio(name)
  }

  function jeSelectionneUneFrequence(name: string): void {
    presserLeBoutonRadio(name)
  }

  function jeChoisisUneDate(value: string): HTMLElement {
    return saisirLeTexte('Date du prochain comité', value)
  }

  function jeTapeUnCommentaire(value: string): HTMLElement {
    return saisirLeTexte('Laissez ici un commentaire général sur le comité', value)
  }

  function jEnregistreLeComite(): HTMLElement {
    return presserLeBouton('Enregistrer')
  }

  function afficherUneGouvernance(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory(), now)
    renderComponent(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />, options)
  }
})
