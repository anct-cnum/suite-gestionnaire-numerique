import { fireEvent, render, screen, within } from '@testing-library/react'

import GestionMembres from './GestionMembres'
import { membresPresenter } from '@/presenters/membresPresenter'
import { membresReadModelFactory } from '@/use-cases/testHelper'

describe('membres', () => {
  it('quand je consulte les membres d’une gouvernance, alors la page s’affiche, positionnée sur la liste des membres confirmés', () => {
    // WHEN
    afficherMembres()

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Gérer les membres · Rhône' })
    const ajouterUnMembre = screen.getByRole('button', { name: 'Ajouter un membre' })
    const exporter = screen.getByRole('button', { name: 'Exporter' })
    expect(titre).toBeInTheDocument()
    expect(ajouterUnMembre).toHaveAttribute('type', 'button')
    expect(ajouterUnMembre).toHaveAttribute('aria-controls', 'drawerId')
    expect(exporter).toHaveAttribute('type', 'button')

    const navigationTypesMembres = screen.getByRole('list')
    const ongletsStatutMembre = within(navigationTypesMembres).getAllByRole('listitem')
    const ongletMembresConfirmes = within(ongletsStatutMembre[0]).getByRole(
      'tab', { current: 'page', name: 'Membres · 5' }
    )
    const ongletMembresSuggeres = within(ongletsStatutMembre[1]).getByRole(
      'tab', { current: false, name: 'Suggestions · 2' }
    )
    const ongletMembresCandidats = within(ongletsStatutMembre[2]).getByRole(
      'tab', { current: false, name: 'Candidats · 3' }
    )
    expect(ongletsStatutMembre).toHaveLength(3)
    expect(ongletMembresConfirmes).toBeInTheDocument()
    expect(ongletMembresSuggeres).toBeInTheDocument()
    expect(ongletMembresCandidats).toBeInTheDocument()

    const filtres = screen.getByText('Filtres :')
    const labelFiltreRoles = screen.getByRole('combobox', { name: 'Filtrer par rôle' })
    const filtresRoles = within(labelFiltreRoles).getAllByRole('option')
    const labelFiltreTypologie = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    const filtresTypologie = within(labelFiltreTypologie).getAllByRole('option')
    expect(filtres).toBeInTheDocument()
    expect(labelFiltreRoles).toBeInTheDocument()
    expect(filtresRoles).toHaveLength(6)
    expect(filtresRoles[0]).toHaveAccessibleName('Rôles')
    expect(filtresRoles[1]).toHaveAccessibleName('Co-financeur')
    expect(filtresRoles[2]).toHaveAccessibleName('Co-porteur')
    expect(filtresRoles[3]).toHaveAccessibleName('Bénéficiaire')
    expect(filtresRoles[4]).toHaveAccessibleName('Observateur')
    expect(filtresRoles[5]).toHaveAccessibleName('Récipiendaire')
    expect(labelFiltreTypologie).toBeInTheDocument()
    expect(filtresTypologie).toHaveLength(7)
    expect(filtresTypologie[0]).toHaveAccessibleName('Typologie')
    expect(filtresTypologie[1]).toHaveAccessibleName('Autre')
    expect(filtresTypologie[2]).toHaveAccessibleName('Collectivité, EPCI')
    expect(filtresTypologie[3]).toHaveAccessibleName('Préfecture départementale')
    expect(filtresTypologie[4]).toHaveAccessibleName('Collectivité, conseil départemental')
    expect(filtresTypologie[5]).toHaveAccessibleName('Entreprise privée')
    expect(filtresTypologie[6]).toHaveAccessibleName('Association')

    const membres = screen.getByRole('table', { name: 'Membres' })
    const rowsGroup = within(membres).getAllByRole('rowgroup')
    const head = rowsGroup[0]
    const rowHead = within(head).getByRole('row')
    const columnsHead = within(rowHead).getAllByRole('columnheader')
    const body = rowsGroup[1]
    const rowsBody = within(body).getAllByRole('row')
    const [columnsBody, suppressionColumnsBody] = membresRow(rowsBody, 0)
    expect(columnsHead).toHaveLength(4)
    expect(columnsHead[0].textContent).toBe('Structure')
    expect(columnsHead[0]).toHaveAttribute('scope', 'col')
    expect(columnsHead[1].textContent).toBe('Contact référent')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Rôles')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    expect(columnsHead[3].textContent).toBe('Action')
    expect(columnsHead[3]).toHaveAttribute('scope', 'col')
    expect(columnsBody[0].textContent).toBe('Préfecture du RhônePréfecture départementale')
    expect(columnsBody[1].textContent).toBe('Laetitia Henrich')
    expect(columnsBody[2].textContent).toBe('Co-porteur ')
    expect(suppressionColumnsBody).toHaveAttribute('type', 'button')
    expect(suppressionColumnsBody).toBeEnabled()
  })

  it.each([
    {
      expectedAriaCurrents: ['false', 'page', 'false'],
      expectedLength: 2,
      expectedRows: [
        'Fédération départementale des centres sociaux du Rhône et de la Métropole de Lyon',
        'Croix Rouge FrançaiseAssociation',
      ],
      position: 1,
      vue: 'suggestions',
    },
    {
      expectedAriaCurrents: ['false', 'false', 'page'],
      expectedLength: 3,
      expectedRows: [
        'CC des Monts du LyonnaisCollectivité, EPCI',
        'La Voie du Num\'Association',
        'Emmaüs ConnectAssociation',
      ],
      position: 2,
      vue: 'candidats',
    },
    {
      expectedAriaCurrents: ['page', 'false', 'false'],
      expectedLength: 5,
      expectedRows: [
        'Préfecture du RhônePréfecture départementale',
        'Rhône (69)Collectivité, conseil départemental',
        'Info-Jeunes Auvergne Rhône-Alpes (CRIJ)Association',
        'OrangeEntreprise privée',
        'Info-Jeunes Rhône (CRIJ)Association',
      ],
      position: 0,
      vue: 'membres',
    },
  ])('quand je sélectionne la vue "$vue", alors la liste se rafraîchit, n’affichant que les membres correspondant au statut sélectionné', ({ position, expectedLength, expectedAriaCurrents, expectedRows }) => {
    // GIVEN
    afficherMembres()

    // WHEN
    const navigationTypesMembres = screen.getByRole('list')
    const ongletsStatutsMembres = within(navigationTypesMembres).getAllByRole('tab')
    fireEvent.click(ongletsStatutsMembres[position])

    // THEN
    const membres = screen.getByRole('table', { name: 'Membres' })
    const rowsGroup = within(membres).getAllByRole('rowgroup')
    const body = rowsGroup[1]
    const rowsBody = within(body).getAllByRole('row')
    expectedAriaCurrents.forEach((expectedAriaCurrent, index) => {
      expect(ongletsStatutsMembres[index].ariaCurrent).toBe(expectedAriaCurrent)
    })
    expect(rowsBody).toHaveLength(expectedLength)
    expectedRows.forEach((cell0, index) => {
      const [columnsBody] = membresRow(rowsBody, index)
      expect(columnsBody[0].textContent).toBe(cell0)
    })
  })

  it('quand je filtre sur un rôle, alors la liste se rafraîchit, n’affichant que les membres correspondant au rôle sélectionné', () => {
    // GIVEN
    afficherMembres()

    // WHEN
    const labelFiltreRoles = screen.getByRole('combobox', { name: 'Filtrer par rôle' })
    fireEvent.change(labelFiltreRoles, { target: { value: 'Co-porteur' } })

    // THEN
    const membres = screen.getByRole('table', { name: 'Membres' })
    const rowsGroup = within(membres).getAllByRole('rowgroup')
    const body = rowsGroup[1]
    const rowsBody = within(body).getAllByRole('row')
    expect(rowsBody).toHaveLength(4)
    rowsBody.forEach((_, index) => {
      const [columnsBody] = membresRow(rowsBody, index)
      expect(columnsBody).toHaveLength(4)
      expect(columnsBody[2].textContent).toContain('Co-porteur')
    })
  })

  it('quand je sélectionne tous les rôles après avoir filtré sur un rôle, alors la liste se rafraîchit en annulant le filtrage', () => {
    // GIVEN
    afficherMembres()

    // WHEN
    const labelFiltreTypologies = screen.getByRole('combobox', { name: 'Filtrer par rôle' })
    fireEvent.change(labelFiltreTypologies, { target: { value: 'Co-porteur' } })
    fireEvent.change(labelFiltreTypologies, { target: { value: 'toutRole' } })

    // THEN
    const membres = screen.getByRole('table', { name: 'Membres' })
    const rowsGroup = within(membres).getAllByRole('rowgroup')
    const body = rowsGroup[1]
    const rowsBody = within(body).queryAllByRole('row')
    expect(rowsBody).toHaveLength(5)
  })

  it('quand je filtre sur une typologie, alors la liste se rafraîchit, n’affichant que les membres correspondant à la typologie sélectionné', () => {
    // GIVEN
    afficherMembres()

    // WHEN
    const labelFiltreRoles = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    fireEvent.change(labelFiltreRoles, { target: { value: 'Association' } })

    // THEN
    const membres = screen.getByRole('table', { name: 'Membres' })
    const rowsGroup = within(membres).getAllByRole('rowgroup')
    const body = rowsGroup[1]
    const rowsBody = within(body).getAllByRole('row')
    expect(rowsBody).toHaveLength(2)
    rowsBody.forEach((_, index) => {
      const [columnsBody] = membresRow(rowsBody, index)
      expect(columnsBody).toHaveLength(4)
      expect(columnsBody[0].textContent).toContain('Association')
    })
  })

  it('quand je sélectionne toutes les typologies après avoir filtré sur une typologie, alors la liste se rafraîchit en annulant le filtrage', () => {
    // GIVEN
    afficherMembres()

    // WHEN
    const labelFiltreTypologies = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    fireEvent.change(labelFiltreTypologies, { target: { value: 'Association' } })
    fireEvent.change(labelFiltreTypologies, { target: { value: 'touteTypologie' } })

    // THEN
    const membres = screen.getByRole('table', { name: 'Membres' })
    const rowsGroup = within(membres).getAllByRole('rowgroup')
    const body = rowsGroup[1]
    const rowsBody = within(body).queryAllByRole('row')
    expect(rowsBody).toHaveLength(5)
  })

  it('quand je filtre sur un rôle et une typologie, alors la liste se rafraîchit n’affichant que les membres correspondant au rôle et à la typologie sélectionnés', () => {
    // GIVEN
    afficherMembres()

    // WHEN
    const labelFiltreRoles = screen.getByRole('combobox', { name: 'Filtrer par rôle' })
    const labelFiltreTypologies = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    fireEvent.change(labelFiltreRoles, { target: { value: 'Co-porteur' } })
    fireEvent.change(labelFiltreTypologies, { target: { value: 'Association' } })

    // THEN
    const membres = screen.getByRole('table', { name: 'Membres' })
    const rowsGroup = within(membres).getAllByRole('rowgroup')
    const body = rowsGroup[1]
    const rowsBody = within(body).queryAllByRole('row')
    expect(rowsBody).toHaveLength(1)
    const [columnsBody] = membresRow(rowsBody, 0)
    expect(columnsBody).toHaveLength(4)
    expect(columnsBody[0].textContent).toBe('Info-Jeunes Rhône (CRIJ)Association')
    expect(columnsBody[1].textContent).toBe('Grégory Geffroy')
    expect(columnsBody[2].textContent).toBe('Co-porteur ')
  })
})

function membresRow(rowsBody: ReadonlyArray<HTMLElement>, rank: number): Readonly<[
  ReadonlyArray<HTMLElement>,
  HTMLElement]> {
  const columnsBody = within(rowsBody[rank]).getAllByRole('cell')
  return [columnsBody, within(columnsBody[3]).getByRole('button', { name: 'Supprimer' })]
}

function afficherMembres(): void {
  const membresViewModel = membresPresenter(membresReadModelFactory())
  render(<GestionMembres membresViewModel={membresViewModel} />)
}
