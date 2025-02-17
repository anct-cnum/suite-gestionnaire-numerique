import { render, screen, within } from '@testing-library/react'

import Membres from './Membres'
import { mesMembresPresenter } from '@/presenters/mesMembresPresenter'
import { membresReadModelFactory } from '@/use-cases/testHelper'

describe('membres', () => {
  it('quand je consulte les membres d’une gouvernance, alors la page s’affiche', () => {
    // GIVEN
    const membresViewModel = mesMembresPresenter(membresReadModelFactory())

    // WHEN
    render(<Membres membresViewModel={membresViewModel} />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Gérer les membres · Rhône' })
    const ajouterUnMembre = screen.getByRole('button', { name: 'Ajouter un membre' })
    const exporter = screen.getByRole('button', { name: 'Exporter' })
    const navigationTypesMembres = screen.getByRole('list')
    const ongletStatutsMembres = within(navigationTypesMembres).getAllByRole('listitem')
    expect(titre).toBeInTheDocument()
    expect(ajouterUnMembre).toHaveAttribute('type', 'button')
    expect(exporter).toHaveAttribute('type', 'button')
    expect(ongletStatutsMembres).toHaveLength(3)
    expect(ongletStatutsMembres[0].textContent).toBe('Membres · 9')
    expect(ongletStatutsMembres[1].textContent).toBe('Suggestions · 0')
    expect(ongletStatutsMembres[2].textContent).toBe('Candidats · 0')

    const filtres = screen.getByText('Filtres :')
    const labelFiltreRoles = screen.getByRole('combobox', { name: 'Filtrer par rôle' })
    const filtresRoles = within(labelFiltreRoles).getAllByRole('option')
    const labelFiltreTypologie = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    const filtresTypologie = within(labelFiltreTypologie).getAllByRole('option')
    expect(filtres).toBeInTheDocument()
    expect(labelFiltreRoles).toBeInTheDocument()
    expect(filtresRoles).toHaveLength(6)
    expect(filtresRoles[0]).toHaveAccessibleName('Rôles')
    expect(filtresRoles[0]).toBeDisabled()
    expect(filtresRoles[1]).toHaveAccessibleName('Co-financeur')
    expect(filtresRoles[2]).toHaveAccessibleName('Co-porteur')
    expect(filtresRoles[3]).toHaveAccessibleName('Bénéficiaire')
    expect(filtresRoles[4]).toHaveAccessibleName('Observateur')
    expect(filtresRoles[5]).toHaveAccessibleName('Récipiendaire')
    expect(labelFiltreTypologie).toBeInTheDocument()
    expect(filtresTypologie).toHaveLength(4)
    expect(filtresTypologie[0]).toHaveAccessibleName('Typologie')
    expect(filtresTypologie[0]).toBeDisabled()
    expect(filtresTypologie[1]).toHaveAccessibleName('Collectivité, EPCI')
    expect(filtresTypologie[2]).toHaveAccessibleName('Préfecture départementale')
    expect(filtresTypologie[3]).toHaveAccessibleName('Association')

    const membres = screen.getByRole('table', { name: 'Membres' })
    const rowsGroup = within(membres).getAllByRole('rowgroup')
    const head = rowsGroup[0]

    const rowHead = within(head).getByRole('row')
    const columnsHead = within(rowHead).getAllByRole('columnheader')

    const body = rowsGroup[1]
    const rowsBody = within(body).getAllByRole('row')
    const columnsBody0 = within(rowsBody[0]).getAllByRole('cell')
    const supressionColumnsBody0 = within(columnsBody0[3]).getByRole('button', { name: 'Supprimer' })
    const columnsBody1 = within(rowsBody[1]).getAllByRole('cell')
    const supressionColumnsBody1 = within(columnsBody1[3]).getByRole('button', { name: 'Supprimer' })

    expect(columnsHead).toHaveLength(4)
    expect(columnsHead[0].textContent).toBe('Structure')
    expect(columnsHead[0]).toHaveAttribute('scope', 'col')
    expect(columnsHead[1].textContent).toBe('Contact référent')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Rôles')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    expect(columnsHead[3].textContent).toBe('Action')
    expect(columnsHead[3]).toHaveAttribute('scope', 'col')

    expect(columnsBody0).toHaveLength(4)
    expect(columnsBody0[0].textContent).toBe('Préfecture du RhônePréfecture départementale')
    expect(columnsBody0[1].textContent).toBe('Laetitia Henrich')
    expect(columnsBody0[2].textContent).toBe('Co-porteur ')
    expect(supressionColumnsBody0).toHaveAttribute('type', 'button')
    expect(supressionColumnsBody0).toBeEnabled()

    expect(columnsBody1).toHaveLength(4)
    expect(columnsBody1[0].textContent).toBe('Rhône (69)Collectivité, conseil départemental')
    expect(columnsBody1[1].textContent).toBe('Pauline Chappuis')
    expect(columnsBody1[2].textContent).toBe('Co-porteur Co-financeur ')
    expect(supressionColumnsBody1).toHaveAttribute('type', 'button')
    expect(supressionColumnsBody1).toBeEnabled()
  })
})
