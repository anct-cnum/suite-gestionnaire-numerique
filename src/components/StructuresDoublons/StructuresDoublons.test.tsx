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
          cle: 'denom:coallia|86194',
          commune: 'Poitiers',
          idsParam: '11,22',
          nbRattachements: 6,
          nbStructures: 2,
          signalLibelle: 'Même nom et commune',
          structures: [
            {
              dejaFusionnee: false,
              denomination: 'COALLIA',
              estAntenne: false,
              id: 11,
              identifiant: '11111111100011',
              nbRattachements: 5,
              source: 'Coop médiation numérique',
            },
            {
              dejaFusionnee: true,
              denomination: 'CADA',
              estAntenne: true,
              id: 22,
              identifiant: '11111111100029',
              nbRattachements: 1,
              source: 'Source inconnue',
            },
          ],
        },
      ],
      total: 1,
    }

    // WHEN
    renderComponent(<StructuresDoublons filtres={filtresVides} tri={triParDefaut} viewModel={viewModel} />)

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Doublons de structures' })).toBeInTheDocument()
    expect(screen.getByText('1 groupe de doublons candidats à examiner.')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Signal' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Département' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nom' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Siret' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'RNA' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Ridet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rattachements' })).toHaveAttribute('title', 'Trier par rattachements')
    expect(screen.getByRole('button', { name: 'Commune' })).toHaveAttribute('title', 'Trier par commune')
    expect(screen.getByRole('button', { name: 'Signal' })).toHaveAttribute('title', 'Trier par signal')
    expect(screen.getByText('COALLIA')).toBeInTheDocument()
    expect(screen.getByText('Coop médiation numérique')).toBeInTheDocument()
    expect(screen.getByText('Antenne')).toBeInTheDocument()
    expect(screen.getByText('Déjà fusionnée')).toBeInTheDocument()
    const lien = screen.getByRole('link', { name: 'Examiner' })
    expect(lien).toHaveAttribute('href', '/structures-doublons/comparer?ids=11,22')
  })

  it('affiche un message dédié et aucun tableau quand il n’y a aucun doublon', () => {
    // GIVEN
    const viewModel: StructuresDoublonsViewModel = { groupes: [], total: 0 }

    // WHEN
    renderComponent(<StructuresDoublons filtres={filtresVides} tri={triParDefaut} viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('Aucun doublon candidat détecté.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})

const filtresVides = { departement: '', nom: '', ridet: '', rna: '', signal: '', siret: '' }
const triParDefaut = { colonne: 'rattachements', ordre: 'desc' } as const
