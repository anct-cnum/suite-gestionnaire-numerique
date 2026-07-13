import { beforeEach, describe, expect, it } from 'vitest'

import {
  GroupeDoublonReadModel,
  RechercherStructuresDoublons,
  SignalDoublon,
  StructureCandidateReadModel,
  StructuresDoublonsLoader,
  StructuresDoublonsReadModel,
} from './RechercherStructuresDoublons'

describe('rechercher les structures en doublon', () => {
  beforeEach(() => {
    spiedSignaux = null
    spiedZone = null
  })

  it('les signaux sélectionnés et la zone sont transmis au loader', async () => {
    // GIVEN
    const query = { signaux: ['nom_commune_proche'] as ReadonlyArray<SignalDoublon>, zone: zoneDepartement }
    const rechercher = new RechercherStructuresDoublons(new StructuresDoublonsLoaderSpy())

    // WHEN
    await rechercher.handle(query)

    // THEN
    expect(spiedSignaux).toStrictEqual(['nom_commune_proche'])
    expect(spiedZone).toStrictEqual(zoneDepartement)
  })

  it('aucun signal sélectionné : la détection porte sur les trois axes', async () => {
    // GIVEN
    const query = { signaux: [] as ReadonlyArray<SignalDoublon> }
    const rechercher = new RechercherStructuresDoublons(new StructuresDoublonsLoaderSpy())

    // WHEN
    await rechercher.handle(query)

    // THEN
    expect(spiedSignaux).toStrictEqual(['identifiant_externe_partage', 'nom_commune_proche', 'siret_antenne_ambigu'])
    expect(spiedZone).toBeUndefined()
  })

  it.each([
    {
      attendu: ['groupe-coallia'],
      criteres: { nom: 'coallia' },
      intention: 'par nom, insensible à la casse, y compris sur la dénomination d’antenne',
    },
    {
      attendu: ['groupe-coallia'],
      criteres: { siret: '111111111' },
      intention: 'par début de siret',
    },
    {
      attendu: ['groupe-emmaus'],
      criteres: { rna: 'W123' },
      intention: 'par rna',
    },
    {
      attendu: ['groupe-emmaus'],
      criteres: { ridet: '7654321' },
      intention: 'par ridet',
    },
    {
      attendu: [],
      criteres: { nom: 'coallia', rna: 'W123' },
      intention: 'critères en ET : aucune structure ne les satisfait tous à la fois',
    },
    {
      attendu: ['groupe-coallia', 'groupe-emmaus'],
      criteres: {},
      intention: 'sans critère, tous les groupes sont conservés',
    },
  ])('filtre les groupes $intention', async ({ attendu, criteres }) => {
    // GIVEN
    const rechercher = new RechercherStructuresDoublons(new StructuresDoublonsLoaderSpy())

    // WHEN
    const groupes = await rechercher.handle({ criteres, signaux: [] })

    // THEN
    expect(groupes.map((groupe) => groupe.cle)).toStrictEqual(attendu)
  })

  it('un groupe est conservé entier dès qu’une seule de ses structures correspond', async () => {
    // GIVEN
    const rechercher = new RechercherStructuresDoublons(new StructuresDoublonsLoaderSpy())

    // WHEN
    const groupes = await rechercher.handle({ criteres: { nom: 'cada' }, signaux: [] })

    // THEN
    expect(groupes).toHaveLength(1)
    expect(groupes[0].structures).toHaveLength(2)
  })
})

const zoneDepartement = { code: '06', type: 'departement' } as const

let spiedSignaux: null | ReadonlyArray<SignalDoublon>
let spiedZone: null | Parameters<typeof StructuresDoublonsLoaderSpy.prototype.doublons>[1]

class StructuresDoublonsLoaderSpy implements StructuresDoublonsLoader {
  async doublons(
    signaux: ReadonlyArray<SignalDoublon>,
    zone?: Parameters<StructuresDoublonsLoader['doublons']>[1]
  ): Promise<StructuresDoublonsReadModel> {
    spiedSignaux = signaux
    spiedZone = zone
    return Promise.resolve(groupesDeTest)
  }
}

const groupesDeTest: ReadonlyArray<GroupeDoublonReadModel> = [
  {
    cle: 'groupe-coallia',
    signal: 'nom_commune_proche',
    structures: [
      structureCandidate({ denomination: 'COALLIA', id: 1, siret: '11111111100011' }),
      structureCandidate({ denominationAntenne: 'CADA COALLIA', id: 2, siret: '22222222200022' }),
    ],
  },
  {
    cle: 'groupe-emmaus',
    signal: 'identifiant_externe_partage',
    structures: [
      structureCandidate({ denomination: 'EMMAUS', id: 3, rna: 'W123456789' }),
      structureCandidate({ denomination: 'EMMAUS CONNECT', id: 4, ridet: '7654321' }),
    ],
  },
]

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
