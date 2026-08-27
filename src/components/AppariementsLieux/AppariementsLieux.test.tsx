import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import AppariementsLieux from './AppariementsLieux'
import { renderComponent } from '@/components/testHelper'
import { AppariementLieuViewModel, AppariementsLieuxViewModel } from '@/presenters/appariementsLieuxPresenter'

describe('revue des appariements de lieux', () => {
  it('affiche la file à valider avec les onglets, les deux côtés de chaque paire et les scores', () => {
    // GIVEN
    const viewModel = viewModelFactory({})

    // WHEN
    renderComponent(<AppariementsLieux viewModel={viewModel} />)

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Appariements de lieux' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'À valider (2)' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Validés (4)' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Rejetés (3)' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('2 paires à arbitrer, triées par score décroissant.')).toBeInTheDocument()
    const table = screen.getByRole('table', { name: 'Appariements de lieux' })
    const enTetes = within(table).getAllByRole('columnheader')
    expect(enTetes.map((enTete) => enTete.textContent)).toStrictEqual([
      'Record cartographie',
      'Lieu coop',
      'Score',
      'Distance',
      'Décision',
    ])
    const ligne = within(table).getAllByRole('row')[1]
    expect(within(ligne).getByText('Atelier numérique')).toBeInTheDocument()
    expect(within(ligne).getByText('36 Rue Cayrade, Decazeville')).toBeInTheDocument()
    expect(within(ligne).getByText('RhinOcc')).toHaveAttribute('title', 'RhinOcc_QxE + RhinOcc_RCR')
    expect(within(ligne).getByRole('link', { name: 'Atelier numérique de Decazeville' })).toHaveAttribute(
      'href',
      '/lieu/14800'
    )
    expect(within(ligne).getByText('92')).toBeInTheDocument()
    expect(within(ligne).getByText('nom 95 · adresse 90 · distance 100')).toBeInTheDocument()
    expect(within(ligne).getByText('12 m')).toBeInTheDocument()
    expect(within(ligne).getByRole('button', { name: 'Valider' })).toBeInTheDocument()
    expect(within(ligne).getByRole('button', { name: 'Rejeter' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument()
  })

  it('valide une paire, notifie et rafraîchit la page', async () => {
    // GIVEN
    const deciderAppariementLieuAction = vi.fn<() => Promise<ReadonlyArray<string>>>().mockResolvedValueOnce(['OK'])
    const refresh = vi.fn<() => void>()
    renderComponent(<AppariementsLieux viewModel={viewModelFactory({})} />, {
      deciderAppariementLieuAction,
      pathname: '/appariements-lieux',
      router: {
        back: vi.fn<() => void>(),
        forward: vi.fn<() => void>(),
        prefetch: vi.fn<() => void>(),
        push: vi.fn<() => void>(),
        refresh,
        replace: vi.fn<() => void>(),
      },
    })

    // WHEN
    await userEvent.click(screen.getAllByRole('button', { name: 'Valider' })[0])

    // THEN
    expect(deciderAppariementLieuAction).toHaveBeenCalledWith({
      cartoRecordId: 'RhinOcc_QxE__RhinOcc_RCR',
      decision: 'valide',
      lieuId: 14800,
      path: '/appariements-lieux',
    })
    await waitFor(() => {
      expect(refresh).toHaveBeenCalledTimes(1)
    })
  })

  it('rejette une paire et affiche l’erreur renvoyée par le serveur', async () => {
    // GIVEN
    const deciderAppariementLieuAction = vi
      .fn<() => Promise<ReadonlyArray<string>>>()
      .mockResolvedValueOnce(['Appariement introuvable ou déjà décidé'])
    const refresh = vi.fn<() => void>()
    renderComponent(<AppariementsLieux viewModel={viewModelFactory({})} />, {
      deciderAppariementLieuAction,
      router: {
        back: vi.fn<() => void>(),
        forward: vi.fn<() => void>(),
        prefetch: vi.fn<() => void>(),
        push: vi.fn<() => void>(),
        refresh,
        replace: vi.fn<() => void>(),
      },
    })

    // WHEN
    await userEvent.click(screen.getAllByRole('button', { name: 'Rejeter' })[1])

    // THEN
    expect(deciderAppariementLieuAction).toHaveBeenCalledWith(
      expect.objectContaining({ cartoRecordId: 'France-Services_2277', decision: 'rejete', lieuId: 6895 })
    )
    await expect(
      screen.findByText('Appariement introuvable ou déjà décidé', { exact: false })
    ).resolves.toBeInTheDocument()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('navigue vers l’historique quand on change d’onglet', async () => {
    // GIVEN
    const push = vi.fn<() => void>()
    renderComponent(<AppariementsLieux viewModel={viewModelFactory({})} />, {
      router: {
        back: vi.fn<() => void>(),
        forward: vi.fn<() => void>(),
        prefetch: vi.fn<() => void>(),
        push,
        refresh: vi.fn<() => void>(),
        replace: vi.fn<() => void>(),
      },
    })

    // WHEN
    await userEvent.click(screen.getByRole('button', { name: 'Validés (4)' }))

    // THEN
    expect(push).toHaveBeenCalledWith('/appariements-lieux?statut=valide')
  })

  it('affiche l’historique des décisions avec leur auteur, et la pagination au-delà d’une page', () => {
    // GIVEN
    const viewModel = viewModelFactory({
      appariements: [
        appariementFactory({
          decision: { le: '25/08/2026', par: 'martin.tartempion@example.net' },
          statut: 'valide',
        }),
        appariementFactory({
          cle: 'France-Services_2277|6895',
          decision: null,
          statut: 'rejete',
        }),
      ],
      onglets: [
        { estActif: false, label: 'À valider', nombre: 2, statut: 'a_valider' },
        { estActif: true, label: 'Validés', nombre: 14, statut: 'valide' },
        { estActif: false, label: 'Rejetés', nombre: 3, statut: 'rejete' },
      ],
      statut: 'valide',
      total: 14,
    })

    // WHEN
    renderComponent(<AppariementsLieux viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('14 paires validées.')).toBeInTheDocument()
    const table = screen.getByRole('table', { name: 'Appariements de lieux' })
    expect(within(table).getAllByRole('columnheader')[4].textContent).toBe('Décidé')
    expect(within(table).getByText('Validé')).toBeInTheDocument()
    expect(within(table).getByText('le 25/08/2026 par martin.tartempion@example.net')).toBeInTheDocument()
    expect(within(table).getByText('Rejeté')).toBeInTheDocument()
    expect(within(table).queryByRole('button', { name: 'Valider' })).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })

  it('affiche un résumé au singulier et aucun tableau quand la file est vide', () => {
    // GIVEN
    const viewModel = viewModelFactory({ appariements: [], statut: 'rejete', total: 0 })

    // WHEN
    renderComponent(<AppariementsLieux viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('0 paire rejetée.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

function viewModelFactory(override: Partial<AppariementsLieuxViewModel>): AppariementsLieuxViewModel {
  return {
    appariements: [
      appariementFactory({}),
      appariementFactory({
        carto: {
          adresse: 'Paron',
          nom: 'France services de Paron',
          recordId: 'France-Services_2277',
          segments: 'France-Services_2277',
          source: 'France Services',
        },
        cle: 'France-Services_2277|6895',
        lieu: { adresse: '3 Place de la Fraternité, Paron', id: 6895, nom: 'France services de Paron' },
      }),
    ],
    onglets: [
      { estActif: true, label: 'À valider', nombre: 2, statut: 'a_valider' },
      { estActif: false, label: 'Validés', nombre: 4, statut: 'valide' },
      { estActif: false, label: 'Rejetés', nombre: 3, statut: 'rejete' },
    ],
    statut: 'a_valider',
    total: 2,
    ...override,
  }
}

function appariementFactory(override: Partial<AppariementLieuViewModel>): AppariementLieuViewModel {
  return {
    carto: {
      adresse: '36 Rue Cayrade, Decazeville',
      nom: 'Atelier numérique',
      recordId: 'RhinOcc_QxE__RhinOcc_RCR',
      segments: 'RhinOcc_QxE + RhinOcc_RCR',
      source: 'RhinOcc',
    },
    cle: 'RhinOcc_QxE__RhinOcc_RCR|14800',
    decision: null,
    distance: '12 m',
    lieu: { adresse: '36 bis Rue Cayrade, Decazeville', id: 14800, nom: 'Atelier numérique de Decazeville' },
    scores: { adresse: '90', distance: '100', global: '92', nom: '95' },
    statut: 'a_valider',
    ...override,
  }
}
