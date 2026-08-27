import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import GestionMembres from './GestionMembres'
import { renderComponent } from '../testHelper'
import { membresPresenter } from '@/presenters/membresPresenter'
import { membresReadModelFactory } from '@/use-cases/testHelper'

const mockPush = vi.hoisted(() => vi.fn<(url: string) => void>())
const mockSearchParams = vi.hoisted(() => ({ current: new URLSearchParams() }))

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock('next/navigation', () => ({
  useRouter: vi.fn<() => object>().mockReturnValue({
    back: vi.fn<() => void>(),
    bfcacheId: '',
    prefetch: vi.fn<() => void>(),
    push: mockPush,
    refresh: vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
  }),
  useSearchParams: vi.fn<() => URLSearchParams>(() => mockSearchParams.current),
}))

describe('gestion des membres gouvernance', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSearchParams.current = new URLSearchParams()
  })

  it('quand je consulte les membres d’une gouvernance, alors la page s’affiche, positionnée sur la liste des membres confirmés', async () => {
    // WHEN
    afficherMembres()

    // THEN
    const allHeadings = screen.getAllByRole('heading', { level: 1 })
    const titre = allHeadings.find((heading) => heading.textContent.includes('Gérer les membres'))
    expect(titre).toBeDefined()
    const ajouterUnMembre = screen.getByRole('button', { name: 'Ajouter un candidat' })
    expect(titre).toBeInTheDocument()
    expect(ajouterUnMembre).toHaveAttribute('type', 'button')

    const navigationTypesMembres = screen.getByRole('list')
    const ongletsStatutMembre = within(navigationTypesMembres).getAllByRole('listitem')
    const allTabsInFirstItem = within(ongletsStatutMembre[0]).getAllByRole('tab')
    const ongletMembresConfirmes = allTabsInFirstItem.find((tab) => tab.textContent.includes('Membres'))
    expect(ongletMembresConfirmes).toBeDefined()
    expect(ongletMembresConfirmes).toHaveAttribute('aria-current', 'page')

    const allTabsInSecondItem = within(ongletsStatutMembre[1]).getAllByRole('tab')
    const ongletMembresCandidats = allTabsInSecondItem.find((tab) => tab.textContent.includes('Candidats'))
    expect(ongletMembresCandidats).toBeDefined()
    expect(ongletMembresCandidats).toHaveAttribute('aria-current', 'false')
    expect(ongletsStatutMembre).toHaveLength(2)
    expect(ongletMembresConfirmes).toBeInTheDocument()
    expect(ongletMembresCandidats).toBeInTheDocument()

    const exporterLesContacts = screen.getByRole('button', { name: 'Exporter les contacts' })
    expect(exporterLesContacts).toHaveAttribute('type', 'button')

    const filtres = screen.getByText('Filtres :')
    const labelFiltreRoles = screen.getByRole('combobox', { name: 'Filtrer par rôle' })
    expect(labelFiltreRoles).not.toBeRequired()
    const labelFiltreTypologie = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    expect(labelFiltreTypologie).not.toBeRequired()
    expect(filtres).toBeInTheDocument()
    await userEvent.click(labelFiltreRoles)
    const optionsRoles = await screen.findAllByRole('option')
    expect(optionsRoles).toHaveLength(5)
    const optionRoles = screen.getByRole('option', { name: 'Rôles', selected: true })
    expect(optionRoles).toBeInTheDocument()
    const optionCoFinanceur = screen.getByRole('option', { name: 'Co-financeur', selected: false })
    expect(optionCoFinanceur).toBeInTheDocument()
    const optionCoPorteur = screen.getByRole('option', { name: 'Co-porteur', selected: false })
    expect(optionCoPorteur).toBeInTheDocument()
    const optionBeneficiaire = screen.getByRole('option', { name: 'Bénéficiaire', selected: false })
    expect(optionBeneficiaire).toBeInTheDocument()
    const optionRecipiendaire = screen.getByRole('option', { name: 'Récipiendaire', selected: false })
    expect(optionRecipiendaire).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(labelFiltreTypologie)
    const optionsTypologie = await screen.findAllByRole('option')
    expect(optionsTypologie).toHaveLength(7)
    const optionTypologie = screen.getByRole('option', { name: 'Typologie', selected: true })
    expect(optionTypologie).toBeInTheDocument()
    const optionAutre = screen.getByRole('option', { name: 'Autre', selected: false })
    expect(optionAutre).toBeInTheDocument()
    const optionCollectivite = screen.getByRole('option', {
      name: 'Collectivité, EPCI',
      selected: false,
    })
    expect(optionCollectivite).toBeInTheDocument()
    const optionPrefecture = screen.getByRole('option', {
      name: 'Préfecture départementale',
      selected: false,
    })
    expect(optionPrefecture).toBeInTheDocument()
    const optionConseilDepartemental = screen.getByRole('option', {
      name: 'Collectivité, conseil départemental',
      selected: false,
    })
    expect(optionConseilDepartemental).toBeInTheDocument()
    const optionEntreprisePrivee = screen.getByRole('option', {
      name: 'Entreprise privée',
      selected: false,
    })
    expect(optionEntreprisePrivee).toBeInTheDocument()
    const optionAssociation = screen.getByRole('option', { name: 'Association', selected: false })
    expect(optionAssociation).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')

    const membres = screen.getByRole('table', { name: 'Membres' })
    const [head, body] = within(membres).getAllByRole('rowgroup')
    const rowHead = within(head).getByRole('row')
    const columnsHead = within(rowHead).getAllByRole('columnheader')
    const rowsBody = within(body).getAllByRole('row')

    expect(columnsHead).toHaveLength(4)
    expect(columnsHead[0].textContent).toBe('Structure')
    expect(columnsHead[0]).toHaveAttribute('scope', 'col')
    expect(columnsHead[1].textContent).toBe('Contacts')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Rôles')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    const columnsBody1 = membresRow(rowsBody, 0)
    expect(columnsBody1).toHaveLength(4)
    expect(columnsBody1[0].textContent).toBe('Préfecture du RhônePréfecture départementale')
    expect(columnsBody1[1].textContent).toBe('1 contact')
    expect(columnsBody1[2].textContent).toBe('Co-porteur ')
    const columnsBody2 = membresRow(rowsBody, 1)
    expect(columnsBody2).toHaveLength(4)
    expect(columnsBody2[0].textContent).toBe('Rhône (69)Collectivité, conseil départemental')
    expect(columnsBody2[1].textContent).toBe('1 contact')
    expect(columnsBody2[2].textContent).toBe('Co-porteur Co-financeur ')
  })

  it.each([
    {
      expectedUrl: '/?statut=candidat',
      position: 1,
      vue: 'candidats',
    },
    {
      expectedUrl: '/?statut=confirme',
      position: 0,
      vue: 'membres',
    },
  ])(
    'quand je sélectionne la vue "$vue", alors je navigue vers l’url portant le statut sélectionné',
    ({ expectedUrl, position }) => {
      // GIVEN
      afficherMembres()

      // WHEN
      const navigationTypesMembres = screen.getByRole('list')
      const ongletsStatutsMembres = within(navigationTypesMembres).getAllByRole('tab')
      fireEvent.click(ongletsStatutsMembres[position])

      // THEN
      expect(mockPush).toHaveBeenCalledWith(expectedUrl)
    }
  )

  it.each([
    {
      expectedAriaCurrents: ['false', 'page'],
      expectedLength: 5,
      expectedRows: [
        'CC des Monts du LyonnaisCollectivité, EPCI',
        "La Voie du Num'Association",
        'Fédération départementale des centres sociaux du Rhône et de la Métropole de Lyon',
        'Emmaüs ConnectAssociation',
        'Croix Rouge FrançaiseAssociation',
      ],
      statut: 'candidat',
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
      statut: 'confirme',
      vue: 'membres',
    },
  ])(
    'quand l’url porte le statut "$statut", alors la liste n’affiche que les membres correspondant à ce statut',
    ({ expectedAriaCurrents, expectedLength, expectedRows, statut }) => {
      // GIVEN
      mockSearchParams.current = new URLSearchParams({ statut })

      // WHEN
      afficherMembres()

      // THEN
      const navigationTypesMembres = screen.getByRole('list')
      const ongletsStatutsMembres = within(navigationTypesMembres).getAllByRole('tab')
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
    }
  )

  it('quand je filtre sur un rôle, alors je navigue vers l’url portant le rôle sélectionné', async () => {
    // GIVEN
    afficherMembres()

    // WHEN
    const labelFiltreRoles = screen.getByRole('combobox', { name: 'Filtrer par rôle' })
    await jeSelectionneLOption(labelFiltreRoles, 'Co-porteur')

    // THEN
    expect(mockPush).toHaveBeenCalledWith('/?role=coporteur')
  })

  it('quand je sélectionne tous les rôles après avoir filtré sur un rôle, alors je navigue vers l’url sans filtre de rôle', async () => {
    // GIVEN
    mockSearchParams.current = new URLSearchParams({ role: 'coporteur' })
    afficherMembres()

    // WHEN
    const labelFiltreRoles = screen.getByRole('combobox', { name: 'Filtrer par rôle' })
    await jeSelectionneLOption(labelFiltreRoles, 'Rôles')

    // THEN
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('quand je filtre sur une typologie, alors je navigue vers l’url portant la typologie sélectionnée', async () => {
    // GIVEN
    afficherMembres()

    // WHEN
    const labelFiltreTypologies = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    await jeSelectionneLOption(labelFiltreTypologies, 'Association')

    // THEN
    expect(mockPush).toHaveBeenCalledWith('/?typologie=Association')
  })

  it('quand je sélectionne toutes les typologies après avoir filtré sur une typologie, alors je navigue vers l’url sans filtre de typologie', async () => {
    // GIVEN
    mockSearchParams.current = new URLSearchParams({ typologie: 'Association' })
    afficherMembres()

    // WHEN
    const labelFiltreTypologies = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    await jeSelectionneLOption(labelFiltreTypologies, 'Typologie')

    // THEN
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('quand je filtre sur une typologie après avoir filtré sur un rôle, alors je navigue vers l’url portant les deux filtres', async () => {
    // GIVEN
    mockSearchParams.current = new URLSearchParams({ role: 'coporteur' })
    afficherMembres()

    // WHEN
    const labelFiltreTypologies = screen.getByRole('combobox', { name: 'Filtrer par typologie' })
    await jeSelectionneLOption(labelFiltreTypologies, 'Association')

    // THEN
    expect(mockPush).toHaveBeenCalledWith('/?role=coporteur&typologie=Association')
  })
})

async function jeSelectionneLOption(combobox: HTMLElement, option: string): Promise<void> {
  await userEvent.click(combobox)
  await userEvent.click(await screen.findByRole('option', { name: option }))
}

function membresRow(rowsBody: ReadonlyArray<HTMLElement>, rank: number): Readonly<ReadonlyArray<HTMLElement>> {
  return within(rowsBody[rank]).getAllByRole('cell')
}

function afficherMembres(options?: Partial<Parameters<typeof renderComponent>[1]>, peutGererGouvernance = true): void {
  const membresViewModel = membresPresenter(membresReadModelFactory())
  renderComponent(
    <GestionMembres membresViewModel={membresViewModel} peutGererGouvernance={peutGererGouvernance} />,
    options
  )
}
