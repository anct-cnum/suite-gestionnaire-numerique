'use client'

import { ReactElement } from 'react'

import {
  fakeStatistiquesData,
  StatistiquesActivites,
  StatistiquesBeneficiaires,
  StatistiquesGenerales,
} from '@/components/coop/Statistiques'

export default function MediateursNumeriques(): ReactElement {
  const {
    accompagnementsParJour,
    accompagnementsParMois,
    activites,
    beneficiaires,
    totalCounts,
  } = fakeStatistiquesData

  return (
    <div className="fr-py-4w">
      <section className="fr-mb-6w">
        <StatistiquesGenerales
          accompagnementsParJour={accompagnementsParJour}
          accompagnementsParMois={accompagnementsParMois}
          totalCounts={totalCounts}
        />
      </section>
      <section className="fr-mb-6w">
        <StatistiquesActivites
          activites={activites}
          totalCounts={totalCounts}
        />
      </section>
      <section className="fr-mb-6w">
        <StatistiquesBeneficiaires beneficiaires={beneficiaires} />
      </section>
    </div>
  )
}
