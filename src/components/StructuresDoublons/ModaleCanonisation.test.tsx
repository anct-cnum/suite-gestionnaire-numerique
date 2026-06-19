import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, Mock, vi } from 'vitest'

import ModaleCanonisation from './ModaleCanonisation'
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import { renderComponent } from '@/components/testHelper'
import { StructureComparaisonViewModel } from '@/presenters/comparaisonDoublonsPresenter'

describe('modale de canonisation (comparaison structure / INSEE)', () => {
  it('charge l’image INSEE, l’affiche et synchronise au clic', async () => {
    // GIVEN
    const rechercherUneEntrepriseAction = rechercherMock().mockResolvedValueOnce(insee)
    const canoniserStructureAction = canoniserMock().mockResolvedValueOnce(['OK'])
    const previsualiserAdresseAction = vi
      .fn<(adresse: string) => Promise<null | Readonly<{ label: string; score: number }>>>()
      .mockResolvedValueOnce({ label: '20 Avenue de Ségur, 75007 Paris', score: 0.97 })
    const refresh = vi.fn<() => void>()
    renderComponent(<ModaleCanonisation isOpen onClose={vi.fn<() => void>()} structure={antenne()} />, {
      canoniserStructureAction,
      pathname: '/structures-doublons/comparer?ids=7,3',
      previsualiserAdresseAction,
      rechercherUneEntrepriseAction,
      router: routerStub({ refresh }),
    })

    // WHEN : l'image INSEE se charge puis on synchronise.
    const bouton = await screen.findByRole('button', { name: 'Synchroniser avec INSEE' })
    expect(rechercherUneEntrepriseAction).toHaveBeenCalledWith({ siret: '13002603200016' })
    expect(screen.getByText('AGENCE NATIONALE')).toBeInTheDocument()
    // APE : code + libellé côté INSEE (comparé au code de la structure, pas au libellé).
    expect(screen.getByText('84.12Z — Administration publique')).toBeInTheDocument()
    // Adresse banifiée affichée côté INSEE (pas la chaîne brute INSEE en majuscules).
    expect(previsualiserAdresseAction).toHaveBeenCalledWith('20 AVENUE DE SEGUR, 75007 PARIS')
    expect(screen.getByText('20 Avenue de Ségur, 75007 Paris')).toBeInTheDocument()
    expect(screen.queryByText('20 AVENUE DE SEGUR, 75007 PARIS')).not.toBeInTheDocument()
    fireEvent.click(bouton)

    // THEN
    await screen.findByRole('status')
    expect(canoniserStructureAction).toHaveBeenCalledWith({
      path: '/structures-doublons/comparer?ids=7,3',
      structureId: 7,
    })
    expect(refresh).toHaveBeenCalledWith()
  })

  it('affiche une erreur quand l’INSEE ne renvoie aucun établissement', async () => {
    // GIVEN
    const rechercherUneEntrepriseAction = rechercherMock().mockResolvedValueOnce([
      'Aucun établissement trouvé avec ce SIRET',
    ])
    renderComponent(<ModaleCanonisation isOpen onClose={vi.fn<() => void>()} structure={antenne()} />, {
      rechercherUneEntrepriseAction,
    })

    // THEN
    const erreur = await screen.findByText('Aucun établissement trouvé avec ce SIRET')
    expect(erreur).toBeInTheDocument()
  })

  it('affiche une erreur de synchronisation sans rafraîchir', async () => {
    // GIVEN
    const rechercherUneEntrepriseAction = rechercherMock().mockResolvedValueOnce(insee)
    const canoniserStructureAction = canoniserMock().mockResolvedValueOnce([
      'Une structure canonique existe déjà pour ce SIRET : fusionnez-la plutôt',
    ])
    const refresh = vi.fn<() => void>()
    renderComponent(<ModaleCanonisation isOpen onClose={vi.fn<() => void>()} structure={antenne()} />, {
      canoniserStructureAction,
      rechercherUneEntrepriseAction,
      router: routerStub({ refresh }),
    })

    // WHEN
    fireEvent.click(await screen.findByRole('button', { name: 'Synchroniser avec INSEE' }))

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toContain('Erreur :')
    expect(refresh).not.toHaveBeenCalled()
  })

  it('ignore le clic « Synchroniser » tant que l’image INSEE n’est pas chargée', () => {
    // GIVEN une récupération INSEE qui ne se résout jamais (état « chargement »).
    const rechercherUneEntrepriseAction = rechercherMock().mockReturnValueOnce(new Promise<never>(() => {}))
    const canoniserStructureAction = canoniserMock().mockResolvedValueOnce(['OK'])
    renderComponent(<ModaleCanonisation isOpen onClose={vi.fn<() => void>()} structure={antenne()} />, {
      canoniserStructureAction,
      rechercherUneEntrepriseAction,
    })

    // WHEN : le bouton est encore au libellé « Chargement… ».
    fireEvent.click(screen.getByRole('button', { name: 'Chargement…' }))

    // THEN
    expect(canoniserStructureAction).not.toHaveBeenCalled()
  })

  it('affiche une erreur réseau si la récupération INSEE échoue', async () => {
    // GIVEN
    const rechercherUneEntrepriseAction = rechercherMock().mockRejectedValueOnce(new Error('réseau'))
    renderComponent(<ModaleCanonisation isOpen onClose={vi.fn<() => void>()} structure={antenne()} />, {
      rechercherUneEntrepriseAction,
    })

    // THEN
    const erreur = await screen.findByText('Erreur lors de la récupération des données INSEE.')
    expect(erreur).toBeInTheDocument()
  })

  it('n’interroge pas l’INSEE tant que la modale est fermée', () => {
    // GIVEN
    const rechercherUneEntrepriseAction = rechercherMock()

    // WHEN
    renderComponent(<ModaleCanonisation isOpen={false} onClose={vi.fn<() => void>()} structure={antenne()} />, {
      rechercherUneEntrepriseAction,
    })

    // THEN
    expect(rechercherUneEntrepriseAction).not.toHaveBeenCalled()
  })

  it('signale l’absence de SIRET sans interroger l’INSEE', async () => {
    // GIVEN
    const rechercherUneEntrepriseAction = rechercherMock()
    renderComponent(<ModaleCanonisation isOpen onClose={vi.fn<() => void>()} structure={antenne({ siret: null })} />, {
      rechercherUneEntrepriseAction,
    })

    // THEN
    const message = await screen.findByText(/La structure n’a pas de SIRET/)
    expect(message).toBeInTheDocument()
    expect(rechercherUneEntrepriseAction).not.toHaveBeenCalled()
  })
})

const insee: EntrepriseViewModel = {
  activitePrincipale: '84.12Z',
  activitePrincipaleLibelle: 'Administration publique',
  adresse: '20 AVENUE DE SEGUR, 75007 PARIS',
  categorieJuridiqueCode: '7389',
  categorieJuridiqueLibelle: 'Établissement public national',
  codeInsee: '75107',
  codePostal: '75007',
  commune: 'PARIS',
  denomination: 'AGENCE NATIONALE',
  identifiant: '13002603200016',
  nomVoie: 'AVENUE DE SEGUR',
  numeroVoie: '20',
}

function rechercherMock(): Mock<
  (actionParam: Readonly<{ siret: string }>) => Promise<EntrepriseViewModel | ReadonlyArray<string>>
> {
  return vi.fn<(actionParam: Readonly<{ siret: string }>) => Promise<EntrepriseViewModel | ReadonlyArray<string>>>()
}

function canoniserMock(): Mock<
  (actionParams: Readonly<{ path: string; structureId: number }>) => Promise<ReadonlyArray<string>>
> {
  return vi.fn<(actionParams: Readonly<{ path: string; structureId: number }>) => Promise<ReadonlyArray<string>>>()
}

function antenne(overrides: Partial<StructureComparaisonViewModel> = {}): StructureComparaisonViewModel {
  return {
    adresse: '1 rue de Test 28000 Chartres',
    champs: [
      { label: 'État administratif', valeur: 'A' },
      { label: 'Code activité (APE)', valeur: '88.99B' },
    ],
    concepts: [],
    denomination: 'Antenne Chartres',
    denominationSirene: 'Antenne Chartres',
    estAssocieLieuInclusion: false,
    estCanonique: false,
    estMembre: false,
    id: 7,
    latitude: 48.45,
    longitude: 1.49,
    rattachements: [],
    rattachementsTotal: 0,
    siret: '13002603200016',
    ...overrides,
  }
}

function routerStub(spies: Readonly<{ push?(): void; refresh?(): void }> = {}): Readonly<{
  back(): void
  forward(): void
  prefetch(): void
  push(): void
  refresh(): void
  replace(): void
}> {
  return {
    back: vi.fn<() => void>(),
    forward: vi.fn<() => void>(),
    prefetch: vi.fn<() => void>(),
    push: spies.push ?? vi.fn<() => void>(),
    refresh: spies.refresh ?? vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
  }
}
