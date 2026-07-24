import { describe, expect, it } from 'vitest'

import { activitesStructurePresenter } from './activitesStructurePresenter'
import { epochTime } from './testHelper'
import { ActivitesStructureReadModel } from '@/use-cases/queries/RecupererActivitesStructure'

describe('activités structure presenter', () => {
  it('affiche les indicateurs formatés et le lien vers les statistiques de la structure', () => {
    // GIVEN
    const readModel = readModelAvecDonnees()

    // WHEN
    const viewModel = activitesStructurePresenter(readModel, 42, epochTime)

    // THEN
    expect(viewModel.totalMediationNumerique).toBe('1\u202f120')
    expect(viewModel.totalAidantsConnect).toBe('18')
    expect(viewModel.beneficiaires).toStrictEqual({
      accompagnes: '68',
      anonymes: '20',
      suivis: '48',
    })
    expect(viewModel.lienStatistiques).toBe('/statistiques?structuresEmployeuses=42')
  })

  it('ne garde que les 6 derniers mois et les 30 derniers jours des séries du graphique', () => {
    // GIVEN
    const readModel: ActivitesStructureReadModel = {
      ...readModelAvecDonnees(),
      parJour: Array.from({ length: 40 }, (_, index) => ({ count: index, label: `jour ${index}` })),
      parMois: Array.from({ length: 12 }, (_, index) => ({ count: index * 10, label: `mois ${index}` })),
    }

    // WHEN
    const viewModel = activitesStructurePresenter(readModel, 42, epochTime)

    // THEN
    expect(viewModel.graphique.parMois.labels).toStrictEqual([
      'mois 6',
      'mois 7',
      'mois 8',
      'mois 9',
      'mois 10',
      'mois 11',
    ])
    expect(viewModel.graphique.parMois.data).toStrictEqual([60, 70, 80, 90, 100, 110])
    expect(viewModel.graphique.parMois.backgroundColor).toHaveLength(6)
    expect(viewModel.graphique.parJour.labels).toHaveLength(30)
    expect(viewModel.graphique.parJour.data[0]).toBe(10)
    expect(viewModel.graphique.parJour.data[29]).toBe(39)
  })

  it('aligne les accompagnements Aidants Connect mensuels sur la fenêtre des 6 derniers mois, uniquement sur la vue mensuelle', () => {
    // GIVEN
    const readModel: ActivitesStructureReadModel = {
      ...readModelAvecDonnees(),
      parMois: [],
      parMoisAidantsConnect: [
        { mois: '1960-01', total: 99 },
        { mois: '1969-12', total: 5 },
        { mois: '1970-01', total: 12 },
      ],
    }

    // WHEN
    const viewModel = activitesStructurePresenter(readModel, 42, epochTime)

    // THEN
    expect(viewModel.graphique.parMois.aidantsConnect?.data).toStrictEqual([0, 0, 0, 0, 5, 12])
    expect(viewModel.graphique.parMois.aidantsConnect?.backgroundColor).toStrictEqual(
      Array.from({ length: 6 }, () => '#ce614a')
    )
    expect(viewModel.graphique.parJour.aidantsConnect).toBeUndefined()
  })

  it('sans donnée, génère des séries à zéro sur les 6 derniers mois et les 30 derniers jours', () => {
    // GIVEN
    const readModel: ActivitesStructureReadModel = {
      ...readModelAvecDonnees(),
      parJour: [],
      parMois: [],
    }

    // WHEN
    const viewModel = activitesStructurePresenter(readModel, 42, epochTime)

    // THEN
    expect(viewModel.graphique.parMois.labels).toHaveLength(6)
    expect(viewModel.graphique.parMois.labels[5]).toBe('janv.')
    expect(viewModel.graphique.parMois.data).toStrictEqual([0, 0, 0, 0, 0, 0])
    expect(viewModel.graphique.parJour.labels).toHaveLength(30)
    expect(viewModel.graphique.parJour.labels[29]).toBe('01/01')
    expect(viewModel.graphique.parJour.data).toStrictEqual(Array.from({ length: 30 }, () => 0))
  })
})

function readModelAvecDonnees(): ActivitesStructureReadModel {
  return {
    accompagnementsAidantsConnect: 18,
    accompagnementsMediationNumerique: 1120,
    beneficiaires: {
      anonymes: 20,
      suivis: 48,
      total: 68,
    },
    parJour: [{ count: 3, label: '10/08' }],
    parMois: [{ count: 93, label: 'Avr.' }],
    parMoisAidantsConnect: [],
  }
}
