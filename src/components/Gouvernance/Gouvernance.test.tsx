import { render, screen, within } from '@testing-library/react'

import Gouvernance from './Gouvernance'

describe('gouvernance', () => {
  it('quand j’affiche la gouvernance vide alors elle s’affiche avec toutes les sections à vide', () => {
    // WHEN
    render(<Gouvernance gouvernanceViewModel={{ departement: 'Rhône' }} />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Inclusion numérique · Rhône' })
    expect(titre).toBeInTheDocument()
    const sousTitre = screen.getByText('Retrouvez la gouvernance établie au sein d’un département, sa composition et ses feuilles de route.', { selector: 'p' })
    expect(sousTitre).toBeInTheDocument()

    const comitologie = screen.getByRole('region', { name: 'Comitologie' })
    const enTeteComitologie = within(comitologie).getByRole('banner')
    const titreComitologie = within(enTeteComitologie).getByRole('heading', { level: 2, name: 'Comitologie' })
    expect(titreComitologie).toBeInTheDocument()
    const contenuComitologie = within(comitologie).getByRole('article')
    const contenuTitreComitologie = within(contenuComitologie).getByText('Actuellement, vous n’avez pas de comité', { selector: 'p' })
    expect(contenuTitreComitologie).toBeInTheDocument()
    const informationComitologie = within(contenuComitologie).getByText('Renseignez les comités prévus et la fréquence à laquelle ils se réunissent.', { selector: 'p' })
    expect(informationComitologie).toBeInTheDocument()
    const ajouterUnComite = screen.getByRole('button', { name: 'Ajouter un comité' })
    expect(ajouterUnComite).toHaveAttribute('type', 'button')

    const membre = screen.getByRole('region', { name: '0 membre' })
    const enTeteMembre = within(membre).getByRole('banner')
    const titreMembre = within(enTeteMembre).getByRole('heading', { level: 2, name: '0 membre' })
    expect(titreMembre).toBeInTheDocument()
    const contenuMembre = within(membre).getByRole('article')
    const contenuTitreMembre = within(contenuMembre).getByText('Actuellement, il n’y a aucun membre dans la gouvernance', { selector: 'p' })
    expect(contenuTitreMembre).toBeInTheDocument()
    const informationMembre = within(contenuMembre).getByText('Vous pouvez inviter les collectivités et structures qui n’ont pas encore manifesté leur souhait de participer et/ou de porter une feuille de route territoriale en leur partageant ce lien vers les formulaires prévus à cet effet :', { selector: 'p' })
    expect(informationMembre).toBeInTheDocument()
    const lienMembre = screen.getByRole('link', { name: 'https://inclusion-numerique.anct.gouv.fr/gouvernance' })
    expect(lienMembre).toHaveAttribute('href', 'https://inclusion-numerique.anct.gouv.fr/gouvernance')
    expect(lienMembre).toHaveAttribute('title', 'Formulaire d’invitation à la gouvernance - nouvelle fenêtre')
    const ajouterDesMembres = screen.getByRole('button', { name: 'Ajouter des membres' })
    expect(ajouterDesMembres).toHaveAttribute('type', 'button')

    const feuilleDeRoute = screen.getByRole('region', { name: '0 feuille de route' })
    const enTeteFeuilleDeRoute = within(feuilleDeRoute).getByRole('banner')
    const titreFeuilleDeRoute = within(enTeteFeuilleDeRoute).getByRole('heading', { level: 2, name: '0 feuille de route' })
    expect(titreFeuilleDeRoute).toBeInTheDocument()
    const contenuFeuilleDeRoute = within(feuilleDeRoute).getAllByRole('article')
    const contenuTitreFeuilleDeRoute = within(contenuFeuilleDeRoute[0]).getByText('Aucune feuille de route', { selector: 'p' })
    expect(contenuTitreFeuilleDeRoute).toBeInTheDocument()
    const informationFeuilleDeRoute = within(contenuFeuilleDeRoute[0]).getByText('Commencez par créer des porteurs au sein de la gouvernance pour définir votre première feuille de route.', { selector: 'p' })
    expect(informationFeuilleDeRoute).toBeInTheDocument()
    const ajouterDesFeuilleDeRoutes = screen.getByRole('button', { name: 'Ajouter une feuille de route' })
    expect(ajouterDesFeuilleDeRoutes).toHaveAttribute('type', 'button')

    const noteDeContexte = screen.getByRole('region', { name: 'Note de contexte' })
    const enTeteNoteDeContexte = within(noteDeContexte).getByRole('banner')
    const titreNoteDeContexte = within(enTeteNoteDeContexte).getByRole('heading', { level: 2, name: 'Note de contexte' })
    expect(titreNoteDeContexte).toBeInTheDocument()
    const contenuNoteDeContexte = within(noteDeContexte).getByRole('article')
    const contenuTitreNoteDeContexte = within(contenuNoteDeContexte).getByText('Aucune note de contexte', { selector: 'p' })
    expect(contenuTitreNoteDeContexte).toBeInTheDocument()
    const informationNoteDeContexte = within(contenuNoteDeContexte).getByText('Précisez, au sein d’une note qualitative, les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez, ou tout autre élément que vous souhaitez porter à notre connaissance.', { selector: 'p' })
    expect(informationNoteDeContexte).toBeInTheDocument()
    const ajouterUneNoteDeContexte = screen.getByRole('button', { name: 'Ajouter une note de contexte' })
    expect(ajouterUneNoteDeContexte).toHaveAttribute('type', 'button')
  })
})
