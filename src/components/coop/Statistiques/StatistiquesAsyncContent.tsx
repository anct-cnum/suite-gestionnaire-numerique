'use client'

import { ReactElement, use } from 'react'

import { StatistiquesActivites } from './_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from './_sections/StatistiquesBeneficiaires'
import { StatistiquesGenerales } from './_sections/StatistiquesGenerales'
import type { StatistiquesMediateursData } from './types'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'

export default function StatistiquesAsyncContent({ statistiquesPromise }: Props): ReactElement {
  const statistiques = use(statistiquesPromise)

  if (isErrorViewModel(statistiques)) {
    return (
      <div className="fr-py-4w">
        <div className="fr-alert fr-alert--error">
          <p>Erreur de récupération de la donnée</p>
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
    tableauAccompagnementsParJour,
    tableauAccompagnementsParMois,
    totalCounts,
  } = statistiques

  return (
    // #2251 : titre, période et sélecteur sont rendus par la page, hors Suspense (EnteteStatistiquesMediateurs)
    // #2357 (RGAA 9.1) : les sections sont sous le h3 « Données et statistiques », leurs titres commencent au h4
    <div className="fr-pt-4w fr-pb-4w">
      <section className="fr-mb-6w">
        <StatistiquesGenerales
          accompagnementsParJour={accompagnementsParJour}
          accompagnementsParMois={accompagnementsParMois}
          tableauAccompagnementsParJour={tableauAccompagnementsParJour}
          niveauTitre="h4"
          tableauAccompagnementsParMois={tableauAccompagnementsParMois}
          totalCounts={totalCounts}
        />
      </section>
      <section className="fr-mb-6w">
        <StatistiquesActivites
          activites={activites}
          communes={communes}
          niveauTitre="h4"
          structures={structures}
          totalCounts={totalCounts}
        />
      </section>
      <section className="fr-mb-6w">
        <StatistiquesBeneficiaires beneficiaires={beneficiaires} niveauTitre="h4" />
      </section>
    </div>
  )
}

type Props = Readonly<{
  statistiquesPromise: Promise<ErrorViewModel | StatistiquesMediateursData>
}>
