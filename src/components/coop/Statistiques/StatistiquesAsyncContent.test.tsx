import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StatistiquesActivites } from './_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from './_sections/StatistiquesBeneficiaires'
import { StatistiquesGenerales } from './_sections/StatistiquesGenerales'
import StatistiquesAsyncContent from './StatistiquesAsyncContent'
import { statistiquesCoopToMediateursData } from './statistiquesCoopToMediateursData'
import { StatistiquesCoopReadModel } from '@/use-cases/queries/RecupererStatistiquesCoop'

describe('niveaux de titre des statistiques des médiateurs (RGAA 9.1)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect = vi.fn<() => void>()
        observe = vi.fn<() => void>()
        unobserve = vi.fn<() => void>()
      }
    )
  })

  it('sur le site vitrine, sous le h3 « Données et statistiques », les titres commencent au niveau 4', () => {
    // GIVEN
    // Promesse déjà résolue, marquée comme telle : use() la lit sans suspendre le rendu
    const statistiques = statistiquesCoopToMediateursData(statistiquesCoop, false)
    const statistiquesPromise = Object.assign(Promise.resolve(statistiques), {
      status: 'fulfilled',
      value: statistiques,
    })

    // WHEN
    render(
      <Suspense>
        <StatistiquesAsyncContent statistiquesPromise={statistiquesPromise} />
      </Suspense>
    )

    // THEN
    expect(titres()).toStrictEqual([
      'H4 Statistiques générales sur les accompagnements',
      "H5 Nombre d'accompagnements",
      'H6 Afficher les données sous forme de tableau',
      'H4 Statistiques sur les accompagnements',
      'H5 Thématiques des accompagnements de médiation numérique',
      'H5 Matériel utilisé lors des accompagnements',
      'H5 Canaux des accompagnements',
      'H5 Durée des accompagnements',
      'H4 Statistiques sur les bénéficiaires',
      'H5 Genres',
      "H5 Tranches d'âge",
      'H5 Statuts',
    ])
  })

  it('dans l’application connectée (/statistiques), les titres des sections restent au niveau 3', () => {
    // GIVEN
    const statistiques = statistiquesCoopToMediateursData(statistiquesCoop, false)

    // WHEN
    render(
      <>
        <StatistiquesGenerales
          accompagnementsParJour={statistiques.accompagnementsParJour}
          accompagnementsParMois={statistiques.accompagnementsParMois}
          tableauAccompagnementsParJour={statistiques.tableauAccompagnementsParJour}
          tableauAccompagnementsParMois={statistiques.tableauAccompagnementsParMois}
          totalCounts={statistiques.totalCounts}
        />
        <StatistiquesActivites activites={statistiques.activites} totalCounts={statistiques.totalCounts} />
        <StatistiquesBeneficiaires beneficiaires={statistiques.beneficiaires} />
      </>
    )

    // THEN
    expect(titres()).toStrictEqual([
      'H3 Statistiques générales sur les accompagnements',
      "H4 Nombre d'accompagnements",
      'H5 Afficher les données sous forme de tableau',
      'H3 Statistiques sur les accompagnements',
      'H4 Thématiques des accompagnements de médiation numérique',
      'H4 Matériel utilisé lors des accompagnements',
      'H4 Canaux des accompagnements',
      'H4 Durée des accompagnements',
      'H3 Statistiques sur les bénéficiaires',
      'H4 Genres',
      "H4 Tranches d'âge",
      'H4 Statuts',
    ])
  })
})

function titres(): ReadonlyArray<string> {
  return screen.getAllByRole('heading').map((titre) => `${titre.tagName} ${(titre.textContent ?? '').trim()}`)
}

const statistiquesCoop: StatistiquesCoopReadModel = {
  accompagnementsParJour: [{ count: 3, label: '10/08' }],
  accompagnementsParMois: [{ count: 93, label: 'Avr.' }],
  activites: {
    durees: [],
    materiels: [],
    tags: [],
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
