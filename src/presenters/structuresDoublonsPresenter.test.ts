import { describe, expect, it } from 'vitest'

import { structuresDoublonsPresenter } from './structuresDoublonsPresenter'
import { GroupeDoublonReadModel, StructureCandidateReadModel } from '@/use-cases/queries/RechercherStructuresDoublons'

describe('structures doublons presenter', () => {
  it('présente un groupe nom+commune multi-établissement avec son badge et le lien d’examen', () => {
    // GIVEN
    const readModel: ReadonlyArray<GroupeDoublonReadModel> = [
      {
        cle: 'denom:coallia|86194',
        multiEtablissement: true,
        signal: 'nom_commune_proche',
        structures: [
          structureCandidate({
            commune: 'Poitiers',
            denomination: 'COALLIA',
            id: 11,
            nbRattachements: 5,
            siret: '11111111100011',
          }),
          structureCandidate({
            commune: 'Poitiers',
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
    })
  })

  it('sans multi-établissement : aucun badge ; libellés de signaux et valeurs de repli corrects', () => {
    // GIVEN
    const readModel: ReadonlyArray<GroupeDoublonReadModel> = [
      {
        cle: 'siret:33333333300031',
        multiEtablissement: false,
        signal: 'siret_antenne_ambigu',
        structures: [structureCandidate({ id: 1, ridet: '1234567', siret: null }), structureCandidate({ id: 2 })],
      },
    ]

    // WHEN
    const viewModel = structuresDoublonsPresenter(readModel)

    // THEN
    expect(viewModel.groupes[0].badges).toStrictEqual([])
    expect(viewModel.groupes[0].signalLibelle).toBe('SIRET à antenne ambiguë')
    expect(viewModel.groupes[0].commune).toBe('—')
    expect(viewModel.groupes[0].structures).toStrictEqual([
      { denomination: 'Structure #1', id: 1, identifiant: '1234567', nbRattachements: 0 },
      { denomination: 'Structure #2', id: 2, identifiant: '—', nbRattachements: 0 },
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
    denomination: null,
    denominationAntenne: null,
    nbRattachements: 0,
    ridet: null,
    siret: null,
    ...overrides,
  }
}
