import { describe, expect, it } from 'vitest'

import {
  RecupererUtilisateursAExporter,
  UtilisateursAExporterLoader,
  UtilisateursAExporterReadModel,
} from './RecupererUtilisateursAExporter'
import { epochTime } from '@/shared/testHelper'

describe('récupérer les utilisateurs à exporter', () => {
  it('je récupère les utilisateurs fournis par le loader', async () => {
    // GIVEN
    const recupererUtilisateursAExporter = new RecupererUtilisateursAExporter(new UtilisateursAExporterLoaderStub())

    // WHEN
    const utilisateurs = await recupererUtilisateursAExporter.handle()

    // THEN
    expect(utilisateurs).toStrictEqual([
      {
        departements: ['Rhône'],
        derniereConnexion: epochTime,
        email: 'martin.tartempion@example.net',
        isActive: true,
        nom: 'Tartempion',
        prenom: 'Martin',
        role: 'membre',
        siret: '11111111111111',
        structure: 'La structure',
        telephone: '0102030405',
      },
    ])
  })
})

class UtilisateursAExporterLoaderStub implements UtilisateursAExporterLoader {
  async get(): Promise<UtilisateursAExporterReadModel> {
    return Promise.resolve([
      {
        departements: ['Rhône'],
        derniereConnexion: epochTime,
        email: 'martin.tartempion@example.net',
        isActive: true,
        nom: 'Tartempion',
        prenom: 'Martin',
        role: 'membre',
        siret: '11111111111111',
        structure: 'La structure',
        telephone: '0102030405',
      },
    ])
  }
}
