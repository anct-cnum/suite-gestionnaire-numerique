import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ListeStructures from './ListeStructures'
import { renderComponent } from '../testHelper'
import { ListeStructuresViewModel, StructureListeViewModel } from '@/presenters/listeStructuresPresenter'

const mockPush = vi.hoisted(() => vi.fn<(url: string) => void>())

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock('next/navigation', () => ({
  usePathname: vi.fn<() => string>().mockReturnValue('/liste-structures'),
  useRouter: vi.fn<() => object>().mockReturnValue({
    back: vi.fn<() => void>(),
    bfcacheId: '',
    forward: vi.fn<() => void>(),
    prefetch: vi.fn<() => void>(),
    push: mockPush,
    refresh: vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
  }),
  useSearchParams: vi.fn<() => URLSearchParams>().mockReturnValue(new URLSearchParams()),
}))

describe('liste structures', () => {
  it('affiche les indicateurs, la recherche et le tableau des structures', () => {
    // WHEN
    renderComponent(
      <ListeStructures
        estScopeNational={true}
        libelleTerritoireRestreint=""
        searchParams={new URLSearchParams()}
        viewModel={viewModel()}
      />
    )

    // THEN
    const indicateurs = screen.getByRole('region', { name: 'Indicateurs des structures' })
    expect(indicateurs.textContent).toContain('Structures habilitées Aidants Connect')
    expect(indicateurs.textContent).toContain('Structures labellisées conseiller numérique')
    expect(indicateurs.textContent).toContain('Sur 25 structures')

    expect(screen.getByRole('searchbox', { name: 'Rechercher une structure' })).toBeDefined()

    const lignes = within(screen.getByRole('table')).getAllByRole('row')
    expect(lignes).toHaveLength(2)
    const cellules = within(lignes[1]).getAllByRole('cell')
    expect(cellules[0].textContent).toBe('Emmaüs ConnectAssociation loi 1901')
    expect(cellules[1].textContent).toContain('69002 LYON')
    expect(cellules[1].textContent).toContain('3 BIS AVENUE CHARLES DE GAULLE')
    const lienSiret = within(cellules[2]).getByRole('link')
    expect(lienSiret.getAttribute('href')).toBe(
      'https://annuaire-entreprises.data.gouv.fr/etablissement/41816609600069'
    )
    expect(lienSiret.getAttribute('target')).toBe('_blank')
    expect(cellules[3].textContent).toBe('Conseiller numériqueAidants Connect')
    const lienFiche = within(cellules[4]).getByRole('link', { name: 'Voir la structure Emmaüs Connect' })
    expect(lienFiche.getAttribute('href')).toBe('/structure/12')
  })

  it('copie l’adresse dans le presse-papiers via le bouton copier', async () => {
    // GIVEN
    const user = userEvent.setup()
    renderComponent(
      <ListeStructures
        estScopeNational={true}
        libelleTerritoireRestreint=""
        searchParams={new URLSearchParams()}
        viewModel={viewModel()}
      />
    )

    // WHEN
    await user.click(screen.getByRole('button', { name: 'Copier l’adresse 3 BIS AVENUE CHARLES DE GAULLE 69002 LYON' }))

    // THEN
    await expect(navigator.clipboard.readText()).resolves.toBe('3 BIS AVENUE CHARLES DE GAULLE 69002 LYON')
  })

  it('affiche un état vide quand aucune structure ne correspond', () => {
    // WHEN
    renderComponent(
      <ListeStructures
        estScopeNational={true}
        libelleTerritoireRestreint=""
        searchParams={new URLSearchParams()}
        viewModel={viewModel({ structures: [] })}
      />
    )

    // THEN
    expect(screen.getByText('Aucune structure ne correspond à votre recherche.')).toBeDefined()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('affiche les filtres actifs et permet de les retirer', async () => {
    // GIVEN
    renderComponent(
      <ListeStructures
        estScopeNational={true}
        libelleTerritoireRestreint=""
        searchParams={new URLSearchParams('codeDepartement=69&labellisation=aidants-connect')}
        viewModel={viewModel()}
      />
    )

    // WHEN
    expect(screen.getByRole('button', { name: 'Retirer le filtre Aidants Connect' })).toBeDefined()
    await userEvent.click(screen.getByRole('button', { name: 'Retirer le filtre Rhône (69)' }))

    // THEN
    expect(mockPush).toHaveBeenCalledWith('/liste-structures?labellisation=aidants-connect')
  })

  it('la recherche navigue avec le paramètre recherche en remettant la page à 1', async () => {
    // GIVEN
    renderComponent(
      <ListeStructures
        estScopeNational={true}
        libelleTerritoireRestreint=""
        searchParams={new URLSearchParams('page=3')}
        viewModel={viewModel()}
      />
    )

    // WHEN
    await userEvent.type(screen.getByRole('searchbox', { name: 'Rechercher une structure' }), 'emmaüs')
    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

    // THEN
    expect(mockPush).toHaveBeenCalledWith(`/liste-structures?recherche=${encodeURIComponent('emmaüs')}`)
  })

  it('le drawer de filtres propose le filtre géographique en scope national', async () => {
    // GIVEN
    renderComponent(
      <ListeStructures
        estScopeNational={true}
        libelleTerritoireRestreint=""
        searchParams={new URLSearchParams()}
        viewModel={viewModel()}
      />
    )

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Filtrer' }))

    // THEN
    expect(screen.getByText('Filtrer les structures')).toBeDefined()
    expect(screen.getByText('Par zone géographique')).toBeDefined()
    expect(screen.getByText('Par Labellisation / Habilitation')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Afficher les structures' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Réinitialiser' })).toBeDefined()
  })

  it('hors scope national, le drawer indique le territoire restreint sans filtre géographique', async () => {
    // GIVEN
    renderComponent(
      <ListeStructures
        estScopeNational={false}
        libelleTerritoireRestreint="Rhône (69)"
        searchParams={new URLSearchParams()}
        viewModel={viewModel()}
      />
    )

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Filtrer' }))

    // THEN
    expect(screen.getByText('Recherche limitée à votre département : Rhône (69)')).toBeDefined()
    expect(screen.queryByText('Par zone géographique')).toBeNull()
  })

  it('affiche le message d’erreur quand le view model est en erreur', () => {
    // WHEN
    renderComponent(
      <ListeStructures
        estScopeNational={true}
        libelleTerritoireRestreint=""
        searchParams={new URLSearchParams()}
        viewModel={{ message: 'Impossible de récupérer la liste des structures', type: 'error' }}
      />
    )

    // THEN
    expect(screen.getByText('Impossible de récupérer la liste des structures')).toBeDefined()
  })
})

function structure(override?: Partial<StructureListeViewModel>): StructureListeViewModel {
  return {
    adresseComplete: '3 BIS AVENUE CHARLES DE GAULLE',
    codePostalCommune: '69002 LYON',
    estHabiliteeAidantsConnect: true,
    estLabelliseeConseillerNumerique: true,
    id: 12,
    lienAnnuaireEntreprises: 'https://annuaire-entreprises.data.gouv.fr/etablissement/41816609600069',
    lienFiche: '/structure/12',
    nom: 'Emmaüs Connect',
    siret: '41816609600069',
    typologie: 'Association loi 1901',
    ...override,
  }
}

function viewModel(override?: Partial<ListeStructuresViewModel>): ListeStructuresViewModel {
  return {
    displayPagination: false,
    limite: 10,
    page: 1,
    structures: [structure()],
    total: 1,
    totalHabiliteesAidantsConnect: 8,
    totalLabelliseesConseillerNumerique: 5,
    totalPages: 1,
    totalStructures: 25,
    ...override,
  }
}
