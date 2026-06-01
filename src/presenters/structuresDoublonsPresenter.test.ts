import { describe, expect, it } from 'vitest'

import { structuresDoublonsPresenter } from './structuresDoublonsPresenter'
import { GroupeDoublonReadModel, StructureCandidateReadModel } from '@/use-cases/queries/RechercherStructuresDoublons'

describe('structures doublons presenter', () => {
  it('présente un groupe nom+commune avec le lien d’examen', () => {
    // GIVEN
    const readModel: ReadonlyArray<GroupeDoublonReadModel> = [
      {
        cle: 'denom:coallia|86194',
        signal: 'nom_commune_proche',
        structures: [
          structureCandidate({
            commune: 'Poitiers',
            denomination: 'COALLIA',
            id: 11,
            nbRattachements: 5,
            siret: '11111111100011',
            source: 'coop',
          }),
          structureCandidate({
            commune: 'Poitiers',
            dejaFusionnee: true,
            denominationAntenne: 'CADA',
            id: 22,
            nbRattachements: 1,
            siret: '11111111100029',
          }),
        ],
      },
    ]

    // WHEN
    const viewModel = structuresDoublonsPresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      groupes: [
        {
          cle: 'denom:coallia|86194',
          commune: 'Poitiers',
          idsParam: '11,22',
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
    })
  })

  it('libellés de signaux et valeurs de repli corrects', () => {
    // GIVEN
    const readModel: ReadonlyArray<GroupeDoublonReadModel> = [
      {
        cle: 'siret:33333333300031',
        signal: 'siret_antenne_ambigu',
        structures: [structureCandidate({ id: 1, ridet: '1234567', siret: null }), structureCandidate({ id: 2 })],
      },
    ]

    // WHEN
    const viewModel = structuresDoublonsPresenter(readModel)

    // THEN
    expect(viewModel.groupes[0].signalLibelle).toBe('SIRET à antenne ambiguë')
    expect(viewModel.groupes[0].commune).toBe('—')
    expect(viewModel.groupes[0].structures).toStrictEqual([
      {
        dejaFusionnee: false,
        denomination: 'Structure #1',
        estAntenne: false,
        id: 1,
        identifiant: '1234567',
        nbRattachements: 0,
        source: 'Source inconnue',
      },
      {
        dejaFusionnee: false,
        denomination: 'Structure #2',
        estAntenne: false,
        id: 2,
        identifiant: '—',
        nbRattachements: 0,
        source: 'Source inconnue',
      },
    ])
  })

  it('un readModel vide produit un total nul et aucun groupe', () => {
    // WHEN
    const viewModel = structuresDoublonsPresenter([])

    // THEN
    expect(viewModel).toStrictEqual({ groupes: [], total: 0 })
  })
})

function structureCandidate(
  overrides: Partial<StructureCandidateReadModel> & Readonly<{ id: number }>
): StructureCandidateReadModel {
  return {
    commune: null,
    dejaFusionnee: false,
    denomination: null,
    denominationAntenne: null,
    nbRattachements: 0,
    ridet: null,
    siret: null,
    source: null,
    ...overrides,
  }
}
