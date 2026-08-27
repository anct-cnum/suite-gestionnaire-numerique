import { describe, expect, it } from 'vitest'

import { appariementsLieuxPresenter } from './appariementsLieuxPresenter'
import { epochTime, epochTimePlusOneDay } from './testHelper'
import { AppariementLieuReadModel } from '@/use-cases/queries/RechercherAppariementsLieux'

describe('appariements de lieux presenter', () => {
  it('présente la file de revue avec les onglets, les adresses et les scores', () => {
    // GIVEN
    const readModel = {
      appariements: [
        appariement({}),
        appariement({
          carto: {
            adresse: null,
            commune: 'Paron',
            nom: null,
            recordId: 'France-Services_2277',
            segments: ['France-Services_2277'],
            source: null,
          },
          distanceM: 1250,
          lieu: {
            codeInsee: null,
            commune: null,
            id: 6895,
            nom: 'France services de Paron',
            nomVoie: null,
            numeroVoie: null,
            repetition: null,
          },
          scores: { adresse: null, distance: null, global: null, nom: null },
        }),
      ],
      compteurs: { a_valider: 2, rejete: 3, valide: 4 },
      total: 2,
    }

    // WHEN
    const viewModel = appariementsLieuxPresenter(readModel, 'a_valider')

    // THEN
    expect(viewModel.statut).toBe('a_valider')
    expect(viewModel.total).toBe(2)
    expect(viewModel.onglets).toStrictEqual([
      { estActif: true, label: 'À valider', nombre: 2, statut: 'a_valider' },
      { estActif: false, label: 'Validés', nombre: 4, statut: 'valide' },
      { estActif: false, label: 'Rejetés', nombre: 3, statut: 'rejete' },
    ])
    expect(viewModel.appariements[0]).toStrictEqual({
      carto: {
        adresse: '36 Rue Cayrade, Decazeville',
        nom: 'Atelier numérique',
        recordId: 'RhinOcc_QxE__RhinOcc_RCR',
        segments: 'RhinOcc_QxE + RhinOcc_RCR',
        source: 'RhinOcc',
      },
      cle: 'RhinOcc_QxE__RhinOcc_RCR|14800',
      decision: null,
      distance: '12 m',
      lieu: {
        adresse: '36 bis Rue Cayrade, Decazeville',
        id: 14800,
        nom: 'Atelier numérique de Decazeville',
      },
      scores: { adresse: '90', distance: '100', global: '92', nom: '95' },
      statut: 'a_valider',
    })
    expect(viewModel.appariements[1]).toStrictEqual({
      carto: {
        adresse: 'Paron',
        nom: 'France-Services_2277',
        recordId: 'France-Services_2277',
        segments: 'France-Services_2277',
        source: 'Source inconnue',
      },
      cle: 'France-Services_2277|6895',
      decision: null,
      distance: '1,3 km',
      lieu: { adresse: '—', id: 6895, nom: 'France services de Paron' },
      scores: { adresse: '—', distance: '—', global: '—', nom: '—' },
      statut: 'a_valider',
    })
  })

  it('présente l’historique avec la décision, son auteur et sa date', () => {
    // GIVEN
    const readModel = {
      appariements: [
        appariement({ decideLe: epochTimePlusOneDay, decidePar: 'martin.tartempion@example.net', statut: 'valide' }),
        appariement({ decideLe: epochTime, decidePar: null, distanceM: null, statut: 'rejete' }),
      ],
      compteurs: { a_valider: 0, rejete: 1, valide: 1 },
      total: 1,
    }

    // WHEN
    const viewModel = appariementsLieuxPresenter(readModel, 'valide')

    // THEN
    expect(viewModel.onglets[1]).toStrictEqual({ estActif: true, label: 'Validés', nombre: 1, statut: 'valide' })
    expect(viewModel.appariements[0].decision).toStrictEqual({ le: '02/01/1970', par: 'martin.tartempion@example.net' })
    expect(viewModel.appariements[0].statut).toBe('valide')
    expect(viewModel.appariements[1].decision).toStrictEqual({ le: '01/01/1970', par: 'Inconnu' })
    expect(viewModel.appariements[1].distance).toBe('—')
  })
})

function appariement(override: Partial<AppariementLieuReadModel>): AppariementLieuReadModel {
  return {
    carto: {
      adresse: '36 Rue Cayrade',
      commune: 'Decazeville',
      nom: 'Atelier numérique',
      recordId: 'RhinOcc_QxE__RhinOcc_RCR',
      segments: ['RhinOcc_QxE', 'RhinOcc_RCR'],
      source: 'RhinOcc',
    },
    decideLe: null,
    decidePar: null,
    derniereDetection: epochTime,
    distanceM: 12,
    lieu: {
      codeInsee: '12089',
      commune: 'Decazeville',
      id: 14800,
      nom: 'Atelier numérique de Decazeville',
      nomVoie: 'Rue Cayrade',
      numeroVoie: 36,
      repetition: 'bis',
    },
    scores: { adresse: 90, distance: 100, global: 92, nom: 95 },
    statut: 'a_valider',
    ...override,
  }
}
