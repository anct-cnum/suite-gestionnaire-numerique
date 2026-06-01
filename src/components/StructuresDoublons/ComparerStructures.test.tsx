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
    const push = vi.fn()
    renderComponent(<ComparerStructures viewModel={deuxStructures()} />, {
      fusionnerStructuresAction,
      pathname: '/structures-doublons/comparer',
      router: { back: vi.fn(), forward: vi.fn(), prefetch: vi.fn(), push, refresh: vi.fn(), replace: vi.fn() },
    })

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Fusionner' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer la fusion' }))

    // THEN
    const notification = await screen.findByRole('status')
    expect(notification.textContent).toBe('Structures fusionnées')
    expect(fusionnerStructuresAction).toHaveBeenCalledWith({
      idAbsorbee: 7,
      idSurvivante: 3,
      path: '/structures-doublons/comparer',
    })
    expect(push).toHaveBeenCalledWith('/structures-doublons')
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
})

function deuxStructures(): ComparaisonViewModel {
  return [structureComparaison(3, 'Conseil Départemental'), structureComparaison(7, 'Antenne Sud')]
}

function structureComparaison(id: number, denomination: string): StructureComparaisonViewModel {
  return {
    adresse: '1 Place Chatelet 28000 Chartres',
    champs: [{ label: 'SIRET', valeur: '22280001300013' }],
    denomination,
    denominationSirene: denomination,
    id,
    rattachements: [{ label: 'Postes', nombre: 15 }],
    rattachementsTotal: 15,
  }
}
