import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ComparerStructures from './ComparerStructures'
import { renderComponent, stubbedServerAction } from '@/components/testHelper'
import {
  ComparaisonViewModel,
  ConceptViewModel,
  StructureComparaisonViewModel,
} from '@/presenters/comparaisonDoublonsPresenter'

describe('consolider un doublon (cible + transfert/fusion par notion)', () => {
  it('affiche les cartes, prend la canonique comme cible par défaut et désactive Appliquer', () => {
    // WHEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // THEN : la canonique (structure 3) est cible → carte source = structure 7.
    expect(screen.getByRole('heading', { level: 1, name: 'Examiner un doublon' })).toBeInTheDocument()
    expect(screen.getByText('Concepts portés (destination)')).toBeInTheDocument()
    expect(screen.getByLabelText(/Idposte/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Appliquer' })).toBeDisabled()
  })

  it('coche une notion sur une source et la transfère via l’action de transfert', async () => {
    // GIVEN
    const transfererNotionsStructureAction = stubbedServerAction(['OK'])
    const push = vi.fn<() => void>()
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />, {
      pathname: '/structures-doublons/comparer',
      router: {
        back: vi.fn<() => void>(),
        forward: vi.fn<() => void>(),
        prefetch: vi.fn<() => void>(),
        push,
        refresh: vi.fn<() => void>(),
        replace: vi.fn<() => void>(),
      },
      transfererNotionsStructureAction,
    })

    // WHEN
    fireEvent.click(screen.getByLabelText(/Idposte/))
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

    // THEN
    await screen.findByRole('status')
    expect(transfererNotionsStructureAction).toHaveBeenCalledWith({
      idCible: 3,
      idSource: 7,
      notions: ['idposte'],
      path: '/structures-doublons/comparer',
    })
    expect(push).toHaveBeenCalledWith('/structures-doublons')
  })

  it('la surcoche « Fusionner » coche toutes les notions et déclenche la fusion', async () => {
    // GIVEN
    const fusionnerStructuresAction = stubbedServerAction(['OK'])
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />, {
      fusionnerStructuresAction,
      pathname: '/structures-doublons/comparer',
    })

    // WHEN
    fireEvent.click(screen.getByLabelText(/Fusionner/))
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

    // THEN
    await screen.findByRole('status')
    expect(fusionnerStructuresAction).toHaveBeenCalledWith({
      idsAbsorbees: [7],
      idSurvivante: 3,
      path: '/structures-doublons/comparer',
    })
  })

  it('une carte canonique non-cible ne propose aucune coche (cible uniquement)', () => {
    // GIVEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // WHEN : on désigne la structure 7 (antenne) comme cible → la canonique (3) devient une carte non-cible.
    fireEvent.click(screen.getAllByRole('radio', { name: 'Cible (destination)' })[1])

    // THEN
    expect(screen.getByText(/jamais transférée ni absorbée/)).toBeInTheDocument()
  })

  it('désactive une notion dont l’id scalaire entre en collision avec la cible', () => {
    // GIVEN cible (3) et source (7) portent Aidants Connect avec un id externe différent.
    const cible = carte({ concepts: [conceptAc('ac-cible')], denomination: 'Cible', estCanonique: true, id: 3 })
    const source = carte({ concepts: [conceptAc('ac-source')], denomination: 'Source', id: 7 })

    // WHEN
    renderComponent(<ComparerStructures viewModel={[cible, source]} />)

    // THEN
    expect(screen.getByLabelText(/Aidants Connect/)).toBeDisabled()
    expect(screen.getByText(/Identifiant déjà porté par la cible/)).toBeInTheDocument()
  })

  it('désactive un id scalaire déjà réclamé par une autre carte source', () => {
    // GIVEN cible sans coop (3) + deux sources (7, 11) portant chacune coop.
    const cible = carte({ denomination: 'Cible', estCanonique: true, id: 3 })
    const sourceA = carte({ concepts: [conceptCoop('coop-a')], denomination: 'Source A', id: 7 })
    const sourceB = carte({ concepts: [conceptCoop('coop-b')], denomination: 'Source B', id: 11 })
    renderComponent(<ComparerStructures viewModel={[cible, sourceA, sourceB]} />)

    // WHEN : on coche Coop sur la source A.
    fireEvent.click(screen.getAllByLabelText(/Coop/)[0])

    // THEN : Coop est désormais désactivé sur la source B.
    expect(screen.getAllByLabelText(/Coop/)[1]).toBeDisabled()
  })

  it('couple Coop et Lieu d’inclusion : cocher l’un coche l’autre et les transfère ensemble', async () => {
    // GIVEN une source portant Coop ET Lieu d’inclusion.
    const transfererNotionsStructureAction = stubbedServerAction(['OK'])
    const viewModel: ComparaisonViewModel = [
      carte({ denomination: 'Cible', estCanonique: true, id: 3 }),
      carte({ concepts: [conceptCoop('coop-x'), conceptLieu()], denomination: 'Source', id: 7 }),
    ]
    renderComponent(<ComparerStructures viewModel={viewModel} />, {
      pathname: '/structures-doublons/comparer',
      transfererNotionsStructureAction,
    })

    // WHEN : on coche uniquement Coop.
    fireEvent.click(screen.getByLabelText(/Coop/))

    // THEN : Lieu d’inclusion est coché automatiquement…
    expect(screen.getByLabelText(/Lieu/)).toBeChecked()

    // …et le transfert porte les deux notions.
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }))
    await screen.findByRole('status')
    expect(transfererNotionsStructureAction).toHaveBeenCalledWith({
      idCible: 3,
      idSource: 7,
      notions: ['coop', 'lieuInclusion'],
      path: '/structures-doublons/comparer',
    })
  })

  it('couple l’indisponibilité : un id Coop en collision désactive aussi Lieu d’inclusion', () => {
    // GIVEN la cible porte déjà un id Coop différent → collision sur la source.
    const viewModel: ComparaisonViewModel = [
      carte({ concepts: [conceptCoop('coop-cible')], denomination: 'Cible', estCanonique: true, id: 3 }),
      carte({ concepts: [conceptCoop('coop-source'), conceptLieu()], denomination: 'Source', id: 7 }),
    ]

    // WHEN
    renderComponent(<ComparerStructures viewModel={viewModel} />)

    // THEN : Coop est verrouillé, et Lieu d’inclusion l’est aussi par couplage.
    // (matcher ancré : le message d’indisponibilité du lieu contient lui aussi le mot « Coop ».)
    expect(screen.getByLabelText(/^Coop/)).toBeDisabled()
    expect(screen.getByLabelText(/^Lieu/)).toBeDisabled()
  })

  it('agrège fusion et transfert et notifie en cas d’échec partiel', async () => {
    // GIVEN la fusion réussit, le transfert échoue.
    const fusionnerStructuresAction = stubbedServerAction(['OK'])
    const transfererNotionsStructureAction = stubbedServerAction(['Conflit'])
    renderComponent(<ComparerStructures viewModel={troisStructures()} />, {
      fusionnerStructuresAction,
      pathname: '/structures-doublons/comparer',
      transfererNotionsStructureAction,
    })

    // WHEN : fusionner la 7, transférer une notion de la 11.
    fireEvent.click(screen.getAllByLabelText(/Fusionner/)[0]) // surcoche de la 1re source (7)
    fireEvent.click(screen.getByLabelText(/Coop/)) // notion coop de la 2e source (11)
    fireEvent.click(screen.getByRole('button', { name: 'Appliquer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }))

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toContain('Erreur :')
    expect(fusionnerStructuresAction).toHaveBeenCalledWith({
      idsAbsorbees: [7],
      idSurvivante: 3,
      path: '/structures-doublons/comparer',
    })
    expect(transfererNotionsStructureAction).toHaveBeenCalledWith({
      idCible: 3,
      idSource: 11,
      notions: ['coop'],
      path: '/structures-doublons/comparer',
    })
  })

  it('bascule sur la vue Distances et affiche la matrice', () => {
    // GIVEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Distances' }))

    // THEN
    expect(screen.getByRole('columnheader', { name: 'Cible' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /Fusionner/ })).not.toBeInTheDocument()
  })

  it('désactive le CTA « Synchroniser avec INSEE » quand une canonique de même SIRET est présente', () => {
    // WHEN : l'antenne 7 partage son SIRET avec la canonique 3.
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // THEN
    expect(screen.getByRole('button', { name: 'Synchroniser avec l’INSEE' })).toBeDisabled()
    expect(screen.getByText(/Une structure canonique de même SIRET est déjà présente/)).toBeInTheDocument()
  })

  it('active le CTA « Synchroniser avec INSEE » sur une antenne sans canonique de même SIRET', () => {
    // GIVEN : antenne 7 avec un SIRET distinct de la canonique 3.
    const viewModel: ComparaisonViewModel = [
      carte({ denomination: 'Cible', estCanonique: true, id: 3 }),
      carte({ denomination: 'Antenne', id: 7, siret: '99999999900099' }),
    ]

    // WHEN
    renderComponent(<ComparerStructures viewModel={viewModel} />)

    // THEN
    expect(screen.getByRole('button', { name: 'Synchroniser avec l’INSEE' })).toBeEnabled()
  })

  it('ouvre la modale de canonisation au clic et déclenche la récupération INSEE', async () => {
    // GIVEN une antenne sans canonique de même SIRET dans le groupe.
    const rechercherUneEntrepriseAction = vi
      .fn<(actionParam: Readonly<{ siret: string }>) => Promise<ReadonlyArray<string>>>()
      .mockResolvedValue(['x'])
    const viewModel: ComparaisonViewModel = [
      carte({ denomination: 'Cible', estCanonique: true, id: 3 }),
      carte({ denomination: 'Antenne', id: 7, siret: '99999999900099' }),
    ]
    renderComponent(<ComparerStructures viewModel={viewModel} />, { rechercherUneEntrepriseAction })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Synchroniser avec l’INSEE' }))

    // THEN : l'ouverture de la modale déclenche la requête INSEE pour ce SIRET.
    await vi.waitFor(() => {
      expect(rechercherUneEntrepriseAction).toHaveBeenCalledWith({ siret: '99999999900099' })
    })
  })
})

function deuxStructures(): ComparaisonViewModel {
  return [
    carte({ denomination: 'Cible', estCanonique: true, id: 3 }),
    carte({ concepts: [conceptIdposte(), conceptAc('ac-xyz')], denomination: 'Antenne', id: 7 }),
  ]
}

function troisStructures(): ComparaisonViewModel {
  return [
    carte({ denomination: 'Cible', estCanonique: true, id: 3 }),
    carte({ concepts: [conceptIdposte()], denomination: 'Source A', id: 7 }),
    carte({ concepts: [conceptCoop('coop-b')], denomination: 'Source B', id: 11 }),
  ]
}

function conceptIdposte(): ConceptViewModel {
  return {
    cle: 'idposte',
    idExterne: null,
    label: 'Idposte',
    present: true,
    resume: '1 poste · 0 contrat · 0 affectation',
  }
}

function conceptAc(idExterne: string): ConceptViewModel {
  return { cle: 'aidantsConnect', idExterne, label: 'Aidants Connect', present: true, resume: '0 aidant' }
}

function conceptCoop(idExterne: string): ConceptViewModel {
  return { cle: 'coop', idExterne, label: 'Coop', present: true, resume: '1 affectation' }
}

function conceptLieu(): ConceptViewModel {
  return { cle: 'lieuInclusion', idExterne: null, label: 'Lieu d’inclusion', present: true, resume: '1 lieu rattaché' }
}

function carte(
  overrides: Partial<StructureComparaisonViewModel> & Readonly<{ denomination: string; id: number }>
): StructureComparaisonViewModel {
  const notionsVides: ReadonlyArray<ConceptViewModel> = []
  return {
    adresse: '1 rue de Test 28000 Chartres',
    champs: [{ label: 'SIRET', valeur: '22280001300013' }],
    concepts: notionsVides,
    denominationSirene: overrides.denomination,
    estAssocieLieuInclusion: false,
    estCanonique: false,
    estMembre: false,
    latitude: 48.45,
    longitude: 1.49,
    rattachements: [{ label: 'Postes', nombre: 1 }],
    rattachementsTotal: 1,
    siret: '22280001300013',
    ...overrides,
  }
}
