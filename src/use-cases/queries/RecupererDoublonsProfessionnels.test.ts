import { describe, expect, it } from 'vitest'

import {
  DoublonsProfessionnelsLoader,
  DoublonsProfessionnelsReadModel,
  RecupererDoublonsProfessionnels,
} from './RecupererDoublonsProfessionnels'

describe('récupérer les doublons de professionnels', () => {
  it('quand je récupère les doublons, alors je reçois la liste fournie par le loader', async () => {
    // GIVEN
    const doublons: DoublonsProfessionnelsReadModel = [
      {
        nom: 'Dupont',
        personneId1: 1,
        personneId2: 2,
        prenom: 'Marie',
        source: 'coop',
        sourceId1: 'uuid-1',
        sourceId2: 'uuid-2',
        structure: 'COMMUNE DE TEST',
        structureAdministrativeId: 10,
      },
    ]
    const loader: DoublonsProfessionnelsLoader = {
      async doublons(): Promise<DoublonsProfessionnelsReadModel> {
        return Promise.resolve(doublons)
      },
    }

    // WHEN
    const readModel = await new RecupererDoublonsProfessionnels(loader).handle()

    // THEN
    expect(readModel).toStrictEqual(doublons)
  })
})
