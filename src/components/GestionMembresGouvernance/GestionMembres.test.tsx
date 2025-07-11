import { fireEvent, screen, within } from '@testing-library/react'

import GestionMembres from './GestionMembres'
import { renderComponent } from '../testHelper'
import { membresPresenter } from '@/presenters/membresPresenter'
import { membresReadModelFactory } from '@/use-cases/testHelper'

vi.mock('next/navigation', () => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  useRouter: () => ({
    // eslint-disable-next-line vitest/require-mock-type-parameters
    back: vi.fn(),
    // eslint-disable-next-line vitest/require-mock-type-parameters
    prefetch: vi.fn(),
    // eslint-disable-next-line vitest/require-mock-type-parameters
    push: vi.fn(),
    // eslint-disable-next-line vitest/require-mock-type-parameters
    refresh: vi.fn(),
    // eslint-disable-next-line vitest/require-mock-type-parameters
    replace: vi.fn(),
  }),
}))

describe('gestion des membres gouvernance', () => {
  it('quand je consulte les membres d’une gouvernance, alors la page s’affiche, positionnée sur la liste des membres confirmés', () => {
    // WHEN
    afficherMembres()

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Gérer les membres · Rhône' })
    const ajouterUnMembre = screen.getByRole('button', { name: 'Ajouter un candidat' })
    expect(titre).toBeInTheDocument()
    expect(ajouterUnMembre).toHaveAttribute('type', 'button')

    const navigationTypesMembres = screen.getByRole('list')
    const ongletsStatutMembre = within(navigationTypesMembres).getAllByRole('listitem')
    const ongletMembresConfirmes = within(ongletsStatutMembre[0]).getByRole(
      'tab', { current: 'page', name: 'Membres · 5' }
    )
    const ongletMembresCandidats = within(ongletsStatutMembre[1]).getByRole(
      'tab', { current: false, name: 'Candidats · 5' }
    )
    expect(ongletsStatutMembre).toHaveLength(2)
    expect(ongletMembresConfirmes).toBeInTheDocument()
    expect(ongletMembresCandidats).toBeInTheDocument()

    const filtres = screen.getByText('Filtres :')
    const labelFiltreRoles = screen.getByRole('combobox', { name: 'Filtrer par rôle' })
    expect(labelFiltreRoles).not.toBeRequired()
    const labelFiltreTypologie = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    expect(labelFiltreTypologie).not.toBeRequired()
    expect(labelFiltreRoles).toHaveLength(5)
    expect(filtres).toBeInTheDocument()
    const optionRoles = within(labelFiltreRoles).getByRole('option', { name: 'Rôles', selected: true })
    expect(optionRoles).toBeInTheDocument()
    const optionCoFinanceur = within(labelFiltreRoles).getByRole('option', { name: 'Co-financeur', selected: false })
    expect(optionCoFinanceur).toBeInTheDocument()
    const optionCoPorteur = within(labelFiltreRoles).getByRole('option', { name: 'Co-porteur', selected: false })
    expect(optionCoPorteur).toBeInTheDocument()
    const optionBeneficiaire = within(labelFiltreRoles).getByRole('option', { name: 'Bénéficiaire', selected: false })
    expect(optionBeneficiaire).toBeInTheDocument()
    const optionRecipiendaire = within(labelFiltreRoles).getByRole('option', { name: 'Récipiendaire', selected: false })
    expect(optionRecipiendaire).toBeInTheDocument()
    expect(labelFiltreTypologie).toHaveLength(7)
    const optionTypologie = within(labelFiltreTypologie).getByRole('option', { name: 'Typologie', selected: true })
    expect(optionTypologie).toBeInTheDocument()
    const optionAutre = within(labelFiltreTypologie).getByRole('option', { name: 'Autre', selected: false })
    expect(optionAutre).toBeInTheDocument()
    const optionCollectivite = within(labelFiltreTypologie).getByRole('option', { name: 'Collectivité, EPCI', selected: false })
    expect(optionCollectivite).toBeInTheDocument()
    const optionPrefecture = within(labelFiltreTypologie).getByRole('option', { name: 'Préfecture départementale', selected: false })
    expect(optionPrefecture).toBeInTheDocument()
    const optionConseilDepartemental = within(labelFiltreTypologie).getByRole('option', { name: 'Collectivité, conseil départemental', selected: false })
    expect(optionConseilDepartemental).toBeInTheDocument()
    const optionEntreprisePrivee = within(labelFiltreTypologie).getByRole('option', { name: 'Entreprise privée', selected: false })
    expect(optionEntreprisePrivee).toBeInTheDocument()
    const optionAssociation = within(labelFiltreTypologie).getByRole('option', { name: 'Association', selected: false })
    expect(optionAssociation).toBeInTheDocument()

    const membres = screen.getByRole('table', { name: 'Membres' })
    const [head, body] = within(membres).getAllByRole('rowgroup')
    const rowHead = within(head).getByRole('row')
    const columnsHead = within(rowHead).getAllByRole('columnheader')
    const rowsBody = within(body).getAllByRole('row')

    expect(columnsHead).toHaveLength(3)// 4
    expect(columnsHead[0].textContent).toBe('Structure')
    expect(columnsHead[0]).toHaveAttribute('scope', 'col')
    expect(columnsHead[1].textContent).toBe('Contact référent')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Rôles')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    const columnsBody1 = membresRow(rowsBody, 0)
    expect(columnsBody1).toHaveLength(3)//
    expect(columnsBody1[0].textContent).toBe('Préfecture du RhônePréfecture départementale')
    expect(columnsBody1[1].textContent).toBe('Laetitia Henrich')
    expect(columnsBody1[2].textContent).toBe('Co-porteur ⋯')
    const columnsBody2 = membresRow(rowsBody, 1)
    expect(columnsBody2).toHaveLength(3)
    expect(columnsBody2[0].textContent).toBe('Rhône (69)Collectivité, conseil départemental')
    expect(columnsBody2[1].textContent).toBe('Pauline Chappuis')
    expect(columnsBody2[2].textContent).toBe('Co-porteur Co-financeur ⋯')
  })

  it.each([
    {
      expectedAriaCurrents: ['false', 'page'],
      expectedLength: 5,
      expectedRows: [
        'CC des Monts du LyonnaisCollectivité, EPCI',
        'La Voie du Num\'Association',
        'Fédération départementale des centres sociaux du Rhône et de la Métropole de Lyon',
        'Emmaüs ConnectAssociation',
        'Croix Rouge FrançaiseAssociation',
      ],
      position: 1,
      vue: 'candidats',
    },
    {
      expectedAriaCurrents: ['page', 'false'],
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
  ])('quand je sélectionne la vue "$vue", alors la liste se rafraîchit, n’affichant que les membres correspondant au statut sélectionné',
    ({ expectedAriaCurrents, expectedLength, expectedRows, position }) => {
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
        const columnsBody = membresRow(rowsBody, index)
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
      const columnsBody = membresRow(rowsBody, index)
      expect(columnsBody).toHaveLength(3)
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
      const columnsBody = membresRow(rowsBody, index)
      expect(columnsBody).toHaveLength(3)
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
    const columnsBody = membresRow(rowsBody, 0)
    expect(columnsBody).toHaveLength(3)
    expect(columnsBody[0].textContent).toBe('Info-Jeunes Rhône (CRIJ)Association')
    expect(columnsBody[1].textContent).toBe('Grégory Geffroy')
    expect(columnsBody[2].textContent).toBe('Co-porteur ⋯')
  })
})

function membresRow(rowsBody: ReadonlyArray<HTMLElement>, rank: number): Readonly<
  ReadonlyArray<HTMLElement>>
{
  return within(rowsBody[rank]).getAllByRole('cell')
}

function afficherMembres(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
  const membresViewModel = membresPresenter(membresReadModelFactory())
  renderComponent(<GestionMembres membresViewModel={membresViewModel} />, options)
}
