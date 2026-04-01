'use client'

import { ReactElement, use } from 'react'

import { StatistiquesActivites } from './_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from './_sections/StatistiquesBeneficiaires'
import { StatistiquesGenerales } from './_sections/StatistiquesGenerales'
import SelecteurRangeDates from './SelecteurRangeDates'
import type { StatistiquesMediateursData } from './types'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'

export default function StatistiquesAsyncContent({
  dateDebut,
  dateFin,
  statistiquesPromise,
}: Props): ReactElement {
  const statistiques = use(statistiquesPromise)

  if (isErrorViewModel(statistiques)) {
    return (
      <div className="fr-py-4w">
        <div
          className="fr-alert fr-alert--error"
          role="alert"
        >
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
    communes,
    structures,
    totalCounts,
  } = statistiques

  return (
    <div className="fr-pt-1w fr-pb-4w">
      <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters fr-mb-4w">
        <div className="fr-col">
          <h3 className="fr-h4 color-blue-france fr-mb-0">Données et statistiques</h3>
        </div>
        <div className="fr-col-auto">
          <SelecteurRangeDates dateDebut={dateDebut} dateFin={dateFin} />
        </div>
      </div>
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
          communes={communes}
          structures={structures}
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
  dateDebut: string
  dateFin: string
  statistiquesPromise: Promise<ErrorViewModel | StatistiquesMediateursData>
}>
