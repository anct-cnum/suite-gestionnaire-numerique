import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ListeLieuxInclusion from './ListeLieuxInclusion'
import { ListeLieuxInclusionViewModel } from '@/presenters/listeLieuxInclusionPresenter'

const mockPush = vi.hoisted(() => vi.fn<(href: string) => void>())

vi.mock(import('next/navigation'), () => ({
  usePathname: (): string => '/liste-lieux-inclusion',
  useRouter: (): ReturnType<typeof import('next/navigation').useRouter> =>
    ({ push: mockPush }) as unknown as ReturnType<typeof import('next/navigation').useRouter>,
  useSearchParams: (): ReturnType<typeof import('next/navigation').useSearchParams> =>
    new URLSearchParams() as unknown as ReturnType<typeof import('next/navigation').useSearchParams>,
}))

describe('onglets de la liste des lieux d’inclusion', () => {
  it('quand le DSFR disclose le panel archives (navigation clavier), alors je navigue vers l’onglet archives', async () => {
    // GIVEN
    mockPush.mockClear()
    render(
      <ListeLieuxInclusion
        listeLieuxInclusionViewModel={viewModel()}
        peutCreer={false}
        peutModifierVisibilite={false}
        peutSupprimer={false}
        searchParams={new URLSearchParams()}
        utilisateurRole="Administrateur dispositif"
      />
    )
    const panelArchives = screen.getByRole('tabpanel', { name: 'Lieux archivés (0)' })

    // WHEN
    fireEvent(panelArchives, new Event('dsfr.disclose'))

    // THEN
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/liste-lieux-inclusion?statut=archives')
    })
  })

  it('quand le DSFR disclose un panel déjà détaché du DOM (démontage vers une fiche lieu), alors aucune navigation parasite n’est déclenchée (#1881)', async () => {
    // GIVEN
    mockPush.mockClear()
    render(
      <ListeLieuxInclusion
        listeLieuxInclusionViewModel={viewModel()}
        peutCreer={false}
        peutModifierVisibilite={false}
        peutSupprimer={false}
        searchParams={new URLSearchParams()}
        utilisateurRole="Administrateur dispositif"
      />
    )
    const panelArchives = screen.getByRole('tabpanel', { name: 'Lieux archivés (0)' })
    // Simule le démontage DSFR : le panel est détaché du DOM au moment du disclose,
    // puis raccroché pour que le cleanup de testing-library se passe sans erreur.
    // eslint-disable-next-line testing-library/no-node-access
    const parent = panelArchives.parentElement

    // WHEN
    panelArchives.remove()
    fireEvent(panelArchives, new Event('dsfr.disclose'))

    // THEN
    // Le router.push fautif partait après 150 ms : on attend au-delà avant de vérifier l'absence d'appel.
    await new Promise((resolve) => {
      setTimeout(resolve, 250)
    })
    expect(mockPush).not.toHaveBeenCalled()
    parent?.appendChild(panelArchives)
  })
})

describe('visibilité cartographique et suppression depuis la liste (#1951)', () => {
  it.each([
    {
      estLieuCoop: false,
      intention: 'un bêta-testeur peut changer la visibilité et supprimer un lieu hors Coop',
      peutModifierVisibilite: true,
      suppressionAttendue: true,
      toggleActif: true,
    },
    {
      estLieuCoop: true,
      intention: 'un lieu géré dans la Coop est en lecture seule : toggle désactivé, pas de suppression',
      peutModifierVisibilite: true,
      suppressionAttendue: false,
      toggleActif: false,
    },
    {
      estLieuCoop: false,
      intention: 'hors flag bêta, le toggle reste désactivé',
      peutModifierVisibilite: false,
      suppressionAttendue: false,
      toggleActif: false,
    },
  ])('$intention', ({ estLieuCoop, peutModifierVisibilite, suppressionAttendue, toggleActif }) => {
    // GIVEN
    render(
      <ListeLieuxInclusion
        listeLieuxInclusionViewModel={viewModel({ estLieuCoop })}
        peutCreer={false}
        peutModifierVisibilite={peutModifierVisibilite}
        peutSupprimer={peutModifierVisibilite}
        searchParams={new URLSearchParams()}
        utilisateurRole="Administrateur dispositif"
      />
    )

    // THEN
    const toggle = screen.getByRole('checkbox')
    expect(toggle.hasAttribute('disabled')).toBe(!toggleActif)
    expect(screen.queryByRole('button', { name: 'Supprimer Lieu test' }) !== null).toBe(suppressionAttendue)
  })
})

describe('ajout d’un lieu depuis la liste (#1495)', () => {
  it.each([
    { intention: 'un administrateur voit le lien « Ajouter un lieu » vers la page de création', peutCreer: true },
    { intention: 'sans droit de création, le lien est absent', peutCreer: false },
  ])('$intention', ({ peutCreer }) => {
    // WHEN
    render(
      <ListeLieuxInclusion
        listeLieuxInclusionViewModel={viewModel()}
        peutCreer={peutCreer}
        peutModifierVisibilite={false}
        peutSupprimer={false}
        searchParams={new URLSearchParams()}
        utilisateurRole="Administrateur dispositif"
      />
    )

    // THEN
    const lien = screen.queryByRole('link', { name: 'Ajouter un lieu' })
    if (peutCreer) {
      expect(lien).toHaveAttribute('href', '/lieu/creer')
    } else {
      expect(lien).not.toBeInTheDocument()
    }
  })
})

function viewModel(lieu: Partial<ListeLieuxInclusionViewModel['lieux'][number]> = {}): ListeLieuxInclusionViewModel {
  return {
    displayPagination: false,
    lieux: [
      {
        adresse: { ligne1: '75001 Paris', ligne2: '1 rue de la Paix' },
        dateArchivage: null,
        derniereMiseAJour: { couleur: 'blue', date: '01/01/2026' },
        estLieuCoop: false,
        id: '5353',
        idCartographieNationale: null,
        nbAccompagnements: 0,
        nom: 'Lieu test',
        tags: [],
        typeStructure: 'Commune',
        visiblePourCartographie: false,
        ...lieu,
      },
    ],
    limite: 10,
    nombreDePages: 1,
    page: 0,
    total: 1,
    totalActifs: 1,
    totalArchives: 0,
    totalConseillerNumerique: 0,
    totalLabellise: 0,
    totalSansRecherche: 1,
  }
}
