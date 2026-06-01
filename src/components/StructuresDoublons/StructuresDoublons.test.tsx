import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import StructuresDoublons from './StructuresDoublons'
import { renderComponent } from '@/components/testHelper'
import { StructuresDoublonsViewModel } from '@/presenters/structuresDoublonsPresenter'

describe('liste des doublons de structures', () => {
  it('affiche les groupes candidats avec leur badge et un lien d’examen', () => {
    // GIVEN
    const viewModel: StructuresDoublonsViewModel = {
      groupes: [
        {
          badges: ['Multi-établissement (même SIREN)'],
          cle: 'denom:coallia|86194',
          commune: 'Poitiers',
          idsParam: '11,22',
          nbStructures: 2,
          signalLibelle: 'Même nom et commune',
          structures: [
            { denomination: 'COALLIA', id: 11, identifiant: '11111111100011', nbRattachements: 5 },
            { denomination: 'CADA', id: 22, identifiant: '11111111100029', nbRattachements: 1 },
          ],
        },
      ],
      total: 1,
    }

    // WHEN
    renderComponent(<StructuresDoublons viewModel={viewModel} />)

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Doublons de structures' })).toBeInTheDocument()
    expect(screen.getByText('1 groupe de doublons candidats à examiner.')).toBeInTheDocument()
    expect(screen.getByText('Multi-établissement (même SIREN)')).toBeInTheDocument()
    expect(screen.getByText('COALLIA')).toBeInTheDocument()
    const lien = screen.getByRole('link', { name: 'Examiner' })
    expect(lien).toHaveAttribute('href', '/structures-doublons/comparer?ids=11,22')
  })

  it('affiche un message dédié et aucun tableau quand il n’y a aucun doublon', () => {
    // GIVEN
    const viewModel: StructuresDoublonsViewModel = { groupes: [], total: 0 }

    // WHEN
    renderComponent(<StructuresDoublons viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('Aucun doublon candidat détecté.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
