import { describe, expect, it } from 'vitest'

import {
  AccompagnementsAcStructureLoader,
  MediateursCoopStructureLoader,
  RecupererActivitesStructure,
} from './RecupererActivitesStructure'
import { StatistiquesCoopLoader, StatistiquesCoopReadModel } from './RecupererStatistiquesCoop'

describe('récupérer les activités d’une structure', () => {
  it('agrège les statistiques Coop des médiateurs de la structure et le total Aidants Connect', async () => {
    // GIVEN
    const recupererCoopIdsParStructure = vi
      .fn<(structureId: number) => Promise<ReadonlyArray<string>>>()
      .mockResolvedValue(['coop-id-1', 'coop-id-2'])
    const mediateursCoopLoader: MediateursCoopStructureLoader = { recupererCoopIdsParStructure }
    const recupererTotalParStructure = vi.fn<(structureId: number) => Promise<number>>().mockResolvedValue(18)
    const recupererParMoisParStructure = vi
      .fn<AccompagnementsAcStructureLoader['recupererParMoisParStructure']>()
      .mockResolvedValue([{ mois: '2026-06', total: 12 }])
    const accompagnementsAcLoader: AccompagnementsAcStructureLoader = {
      recupererParMoisParStructure,
      recupererTotalParStructure,
    }
    const recupererStatistiques = vi
      .fn<StatistiquesCoopLoader['recupererStatistiques']>()
      .mockResolvedValue(statistiquesCoop)
    const statistiquesCoopLoader: StatistiquesCoopLoader = { recupererStatistiques }

    // WHEN
    const readModel = await new RecupererActivitesStructure(
      mediateursCoopLoader,
      statistiquesCoopLoader,
      accompagnementsAcLoader
    ).handle({ structureId: 42 })

    // THEN
    expect(recupererCoopIdsParStructure).toHaveBeenCalledWith(42)
    expect(recupererTotalParStructure).toHaveBeenCalledWith(42)
    expect(recupererParMoisParStructure).toHaveBeenCalledWith(42)
    expect(recupererStatistiques).toHaveBeenCalledWith({ mediateurs: ['coop-id-1', 'coop-id-2'] })
    expect(readModel).toStrictEqual({
      accompagnementsAidantsConnect: 18,
      accompagnementsMediationNumerique: 120,
      beneficiaires: {
        anonymes: 20,
        suivis: 48,
        total: 68,
      },
      parJour: [{ count: 3, label: '10/08' }],
      parMois: [{ count: 93, label: 'Avr.' }],
      parMoisAidantsConnect: [{ mois: '2026-06', total: 12 }],
    })
  })

  it('sans médiateur rattaché, n’appelle pas l’API Coop et renvoie des statistiques à zéro', async () => {
    // GIVEN
    const mediateursCoopLoader: MediateursCoopStructureLoader = {
      recupererCoopIdsParStructure: vi
        .fn<(structureId: number) => Promise<ReadonlyArray<string>>>()
        .mockResolvedValue([]),
    }
    const accompagnementsAcLoader: AccompagnementsAcStructureLoader = {
      recupererParMoisParStructure: vi
        .fn<AccompagnementsAcStructureLoader['recupererParMoisParStructure']>()
        .mockResolvedValue([{ mois: '2026-05', total: 3 }]),
      recupererTotalParStructure: vi.fn<(structureId: number) => Promise<number>>().mockResolvedValue(7),
    }
    const recupererStatistiques = vi.fn<StatistiquesCoopLoader['recupererStatistiques']>()
    const statistiquesCoopLoader: StatistiquesCoopLoader = { recupererStatistiques }

    // WHEN
    const readModel = await new RecupererActivitesStructure(
      mediateursCoopLoader,
      statistiquesCoopLoader,
      accompagnementsAcLoader
    ).handle({ structureId: 42 })

    // THEN
    expect(recupererStatistiques).not.toHaveBeenCalled()
    expect(readModel).toStrictEqual({
      accompagnementsAidantsConnect: 7,
      accompagnementsMediationNumerique: 0,
      beneficiaires: {
        anonymes: 0,
        suivis: 0,
        total: 0,
      },
      parJour: [],
      parMois: [],
      parMoisAidantsConnect: [{ mois: '2026-05', total: 3 }],
    })
  })
})

const statistiquesCoop: StatistiquesCoopReadModel = {
  accompagnementsParJour: [{ count: 3, label: '10/08' }],
  accompagnementsParMois: [{ count: 93, label: 'Avr.' }],
  activites: {
    durees: [],
    materiels: [],
    thematiques: [],
    thematiquesDemarches: [],
    total: 0,
    typeActivites: [],
    typeLieu: [],
  },
  beneficiaires: {
    genres: [],
    statutsSocial: [],
    total: 68,
    trancheAges: [],
  },
  totaux: {
    accompagnements: {
      collectifs: { proportion: 0, total: 0 },
      demarches: { proportion: 0, total: 0 },
      individuels: { proportion: 0, total: 120 },
      total: 120,
    },
    activites: {
      collectifs: { participants: 0, proportion: 0, total: 0 },
      demarches: { proportion: 0, total: 0 },
      individuels: { proportion: 0, total: 0 },
      total: 0,
    },
    beneficiaires: {
      anonymes: 20,
      nouveaux: 0,
      suivis: 48,
      total: 68,
    },
  },
}
