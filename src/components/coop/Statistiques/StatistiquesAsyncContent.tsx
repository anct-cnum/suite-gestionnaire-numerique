'use client'

import { ReactElement, use } from 'react'

import { StatistiquesActivites } from './_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from './_sections/StatistiquesBeneficiaires'
import { StatistiquesGenerales } from './_sections/StatistiquesGenerales'
import type { StatistiquesMediateursData } from './types'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'

export default function StatistiquesAsyncContent({
  statistiquesPromise,
}: Props): ReactElement {
  const statistiques = use(statistiquesPromise)

  if (isErrorViewModel(statistiques)) {
    return (
      <div className="fr-py-4w">
        <div className="fr-alert fr-alert--error">
          <p>
            Erreur de récupération de la donnée depuis la Coop
          </p>
        </div>
      </div>
    )
  }

  const {
    accompagnementsParJour,
    accompagnementsParMois,
    activites,
    beneficiaires,
    totalCounts,
  } = statistiques

  return (
    <div className="fr-py-4w">
      <h2 className="fr-h3 color-blue-france fr-mb-4w">
        Données et statistiques
      </h2>
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

type Props = Readonly<{
  statistiquesPromise: Promise<ErrorViewModel | StatistiquesMediateursData>
}>
