import { describe, expect, it } from 'vitest'

import { structuresDoublonsPresenter, TriDoublons, triDoublonsParDefaut } from './structuresDoublonsPresenter'
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
    const viewModel = structuresDoublonsPresenter(readModel, triDoublonsParDefaut)

    // THEN
    expect(viewModel).toStrictEqual({
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
    const viewModel = structuresDoublonsPresenter(readModel, triDoublonsParDefaut)

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

  it('trie les groupes par nombre total de rattachements décroissant', () => {
    // GIVEN
    const readModel: ReadonlyArray<GroupeDoublonReadModel> = [
      {
        cle: 'groupe-faible-impact',
        signal: 'nom_commune_proche',
        structures: [structureCandidate({ id: 1, nbRattachements: 1 }), structureCandidate({ id: 2 })],
      },
      {
        cle: 'groupe-fort-impact',
        signal: 'nom_commune_proche',
        structures: [
          structureCandidate({ id: 3, nbRattachements: 4 }),
          structureCandidate({ id: 4, nbRattachements: 3 }),
        ],
      },
    ]

    // WHEN
    const viewModel = structuresDoublonsPresenter(readModel, triDoublonsParDefaut)

    // THEN
    expect(viewModel.groupes.map((groupe) => groupe.cle)).toStrictEqual(['groupe-fort-impact', 'groupe-faible-impact'])
    expect(viewModel.groupes[0].nbRattachements).toBe(7)
    expect(viewModel.groupes[1].nbRattachements).toBe(1)
  })

  it.each([
    {
      attendu: ['groupe-fort-impact', 'groupe-faible-impact'],
      intention: 'par rattachements croissants inversés',
      tri: { colonne: 'rattachements', ordre: 'desc' } as TriDoublons,
    },
    {
      attendu: ['groupe-faible-impact', 'groupe-fort-impact'],
      intention: 'par rattachements croissants',
      tri: { colonne: 'rattachements', ordre: 'asc' } as TriDoublons,
    },
    {
      attendu: ['groupe-fort-impact', 'groupe-faible-impact'],
      intention: 'par commune alphabétique',
      tri: { colonne: 'commune', ordre: 'asc' } as TriDoublons,
    },
    {
      attendu: ['groupe-faible-impact', 'groupe-fort-impact'],
      intention: 'par libellé de signal alphabétique',
      tri: { colonne: 'signal', ordre: 'asc' } as TriDoublons,
    },
  ])('trie les groupes $intention', ({ attendu, tri }) => {
    // GIVEN
    const readModel: ReadonlyArray<GroupeDoublonReadModel> = [
      {
        cle: 'groupe-faible-impact',
        // « Identifiant externe partagé » < « Même nom et commune »
        signal: 'identifiant_externe_partage',
        structures: [
          structureCandidate({ commune: 'Zicavo', id: 1, nbRattachements: 1 }),
          structureCandidate({ commune: 'Zicavo', id: 2 }),
        ],
      },
      {
        cle: 'groupe-fort-impact',
        signal: 'nom_commune_proche',
        structures: [
          structureCandidate({ commune: 'Ajaccio', id: 3, nbRattachements: 4 }),
          structureCandidate({ commune: 'Ajaccio', id: 4, nbRattachements: 3 }),
        ],
      },
    ]

    // WHEN
    const viewModel = structuresDoublonsPresenter(readModel, tri)

    // THEN
    expect(viewModel.groupes.map((groupe) => groupe.cle)).toStrictEqual(attendu)
  })

  it('un readModel vide produit un total nul et aucun groupe', () => {
    // WHEN
    const viewModel = structuresDoublonsPresenter([], triDoublonsParDefaut)

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
    rna: null,
    siret: null,
    source: null,
    ...overrides,
  }
}
