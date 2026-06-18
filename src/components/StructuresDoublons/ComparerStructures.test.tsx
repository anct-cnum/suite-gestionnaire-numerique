import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ComparerStructures from './ComparerStructures'
import { renderComponent, stubbedServerAction } from '@/components/testHelper'
import { ComparaisonViewModel, StructureComparaisonViewModel } from '@/presenters/comparaisonDoublonsPresenter'

describe('examiner et fusionner un doublon', () => {
  it('affiche les structures du groupe et le bouton de fusion', () => {
    // WHEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Examiner un doublon' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Conseil Départemental' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Antenne Sud' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fusionner' })).toBeEnabled()
  })

  it('confirme la fusion : appelle l’action avec survivante/absorbée, notifie et redirige', async () => {
    // GIVEN
    const fusionnerStructuresAction = stubbedServerAction(['OK'])
    const push = vi.fn<() => void>()
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />, {
      fusionnerStructuresAction,
      pathname: '/structures-doublons/comparer',
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
    fireEvent.click(screen.getByRole('button', { name: 'Fusionner' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la fusion' }))

    // THEN
    const notification = await screen.findByRole('status')
    expect(notification.textContent).toBe('Structures fusionnées')
    expect(fusionnerStructuresAction).toHaveBeenCalledWith({
      idsAbsorbees: [7],
      idSurvivante: 3,
      path: '/structures-doublons/comparer',
    })
    expect(push).toHaveBeenCalledWith('/structures-doublons')
  })

  it('fusionne plusieurs structures dans la survivante', async () => {
    // GIVEN
    const fusionnerStructuresAction = stubbedServerAction(['OK'])
    renderComponent(<ComparerStructures viewModel={troisStructures()} />, {
      fusionnerStructuresAction,
      pathname: '/structures-doublons/comparer',
    })

    // WHEN : la 2e carte est absorbée par défaut, on ajoute la 3e
    fireEvent.click(screen.getAllByRole('radio', { name: 'Fusionner dans la survivante' })[2])
    fireEvent.click(screen.getByRole('button', { name: 'Fusionner' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la fusion' }))

    // THEN
    await screen.findByRole('status')
    expect(fusionnerStructuresAction).toHaveBeenCalledWith({
      idsAbsorbees: [7, 11],
      idSurvivante: 3,
      path: '/structures-doublons/comparer',
    })
  })

  it('affiche une notification d’erreur si la fusion échoue', async () => {
    // GIVEN
    const fusionnerStructuresAction = stubbedServerAction(['Structure introuvable ou déjà supprimée'])
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />, { fusionnerStructuresAction })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Fusionner' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la fusion' }))

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : Structure introuvable ou déjà supprimée')
  })

  it('marque la structure canonique d’un tag et l’autre comme antenne', () => {
    // WHEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // THEN
    expect(screen.getByText('Canonique')).toBeInTheDocument()
    expect(screen.getByText('Antenne')).toBeInTheDocument()
  })

  it('marque d’un tag Membre la structure qui porte un membre de gouvernance', () => {
    // WHEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // THEN
    expect(screen.getByText('Membre')).toBeInTheDocument()
  })

  it('marque d’un tag Lieu d’inclusion la structure associée à un lieu d’inclusion', () => {
    // WHEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // THEN
    expect(screen.getByText('Lieu d’inclusion rattaché')).toBeInTheDocument()
  })

  it('affiche le détail des rattachements de chaque structure', () => {
    // WHEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // THEN
    expect(screen.getAllByText('Détail des rattachements')).toHaveLength(2)
    expect(screen.getAllByText('Postes :', { exact: false }).length).toBeGreaterThan(0)
  })

  it('bascule sur la vue Distances et affiche la matrice de distances entre structures', () => {
    // GIVEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Distances' }))

    // THEN
    expect(screen.getByRole('columnheader', { name: 'Conseil Départemental' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Antenne Sud' })).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: 'Conserver (survivante)' })).not.toBeInTheDocument()
  })

  it('« Ne pas toucher » retire la carte de la fusion et désactive le bouton', () => {
    // GIVEN
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />)

    // WHEN : on retire la survivante par défaut (1re carte)
    fireEvent.click(screen.getAllByRole('radio', { name: 'Ne pas toucher' })[0])

    // THEN
    expect(screen.getByRole('button', { name: 'Fusionner' })).toBeDisabled()
  })
})

function deuxStructures(): ComparaisonViewModel {
  return [structureComparaison(3, 'Conseil Départemental'), structureComparaison(7, 'Antenne Sud')]
}

function troisStructures(): ComparaisonViewModel {
  return [
    structureComparaison(3, 'Conseil Départemental'),
    structureComparaison(7, 'Antenne Sud'),
    structureComparaison(11, 'Antenne Est'),
  ]
}

function structureComparaison(id: number, denomination: string): StructureComparaisonViewModel {
  return {
    adresse: '1 Place Chatelet 28000 Chartres',
    champs: [{ label: 'SIRET', valeur: '22280001300013' }],
    denomination,
    denominationSirene: denomination,
    estAssocieLieuInclusion: id === 7,
    estCanonique: id === 3,
    estMembre: id === 7,
    id,
    latitude: id === 3 ? 48.45 : 48.5,
    longitude: id === 3 ? 1.49 : 1.6,
    rattachements: [{ label: 'Postes', nombre: 15 }],
    rattachementsTotal: 15,
  }
}
