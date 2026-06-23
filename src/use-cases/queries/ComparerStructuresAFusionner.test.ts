import { beforeEach, describe, expect, it } from 'vitest'

import {
  ComparaisonDoublonsLoader,
  ComparaisonDoublonsReadModel,
  ComparerStructuresAFusionner,
  RattachementsReadModel,
  StructureDetailReadModel,
} from './ComparerStructuresAFusionner'

describe('comparer les structures à fusionner', () => {
  beforeEach(() => {
    spiedIds = null
  })

  it('transmet les identifiants au loader et trie par rattachements décroissants (survivante suggérée en tête)', async () => {
    // GIVEN
    const peuRattachee = structureDetail(11, 3)
    const tresRattachee = structureDetail(22, 40)
    const comparer = new ComparerStructuresAFusionner(loaderAvec([peuRattachee, tresRattachee]))

    // WHEN
    const result = await comparer.handle({ ids: [11, 22] })

    // THEN
    expect(spiedIds).toStrictEqual([11, 22])
    expect(result.map((structure) => structure.id)).toStrictEqual([22, 11])
  })

  it('à rattachements égaux, le plus petit identifiant prime', async () => {
    // GIVEN
    const comparer = new ComparerStructuresAFusionner(loaderAvec([structureDetail(9, 5), structureDetail(4, 5)]))

    // WHEN
    const result = await comparer.handle({ ids: [9, 4] })

    // THEN
    expect(result.map((structure) => structure.id)).toStrictEqual([4, 9])
  })
})

let spiedIds: null | ReadonlyArray<number>

function loaderAvec(structures: ComparaisonDoublonsReadModel): ComparaisonDoublonsLoader {
  return {
    comparer(ids: ReadonlyArray<number>): Promise<ComparaisonDoublonsReadModel> {
      spiedIds = ids
      return Promise.resolve(structures)
    },
  }
}

function structureDetail(id: number, total: number): StructureDetailReadModel {
  const rattachements: RattachementsReadModel = {
    affectationsAc: 0,
    affectationsCoop: 0,
    affectationsEmploi: total,
    affectationsIdposte: 0,
    associationsLieux: 0,
    contacts: 0,
    contrats: 0,
    feuillesDeRoute: 0,
    gouvernances: 0,
    membresMin: 0,
    postes: 0,
    total,
    utilisateursMin: 0,
  }
  return {
    adresse: null,
    codeActivitePrincipale: null,
    commune: null,
    dejaFusionnee: false,
    denominationAntenne: null,
    denominationSirene: null,
    estBeneficiaire: false,
    etatAdministratif: null,
    id,
    latitude: null,
    longitude: null,
    nbMandatsAc: null,
    rattachements,
    ridet: null,
    rna: null,
    siret: null,
    source: null,
    structureAcId: null,
    structureCoopId: null,
    structureTpId: null,
  }
}
