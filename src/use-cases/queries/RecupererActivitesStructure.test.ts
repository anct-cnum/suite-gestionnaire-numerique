import { describe, expect, it } from 'vitest'

import { AccompagnementsAcStructureLoader, RecupererActivitesStructure } from './RecupererActivitesStructure'
import { StatistiquesCoopLoader, StatistiquesCoopReadModel } from './RecupererStatistiquesCoop'

describe('récupérer les activités d’une structure', () => {
  it('agrège les statistiques Coop de la structure (filtre structuresEmployeuses) et le total Aidants Connect', async () => {
    // GIVEN
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
    const readModel = await new RecupererActivitesStructure(statistiquesCoopLoader, accompagnementsAcLoader).handle({
      structureId: 42,
    })

    // THEN
    expect(recupererTotalParStructure).toHaveBeenCalledWith(42)
    expect(recupererParMoisParStructure).toHaveBeenCalledWith(42)
    expect(recupererStatistiques).toHaveBeenCalledWith({ structuresEmployeuses: ['42'] })
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
})

const statistiquesCoop: StatistiquesCoopReadModel = {
  accompagnementsParJour: [{ count: 3, label: '10/08' }],
  accompagnementsParMois: [{ count: 93, label: 'Avr.' }],
  activites: {
    durees: [],
    materiels: [],
    thematiques: [],
    thematiquesDemarches: [],
    totalAccompagnements: 0,
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
