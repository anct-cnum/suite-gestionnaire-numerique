'use client'

import { use } from 'react'

import { StatistiquesActivites } from '@/components/coop/Statistiques/_sections/StatistiquesActivites'
import { StatistiquesBeneficiaires } from '@/components/coop/Statistiques/_sections/StatistiquesBeneficiaires'
import { StatistiquesGenerales } from '@/components/coop/Statistiques/_sections/StatistiquesGenerales'
import { PrintStatistiques } from '@/components/coop/Statistiques/PrintStatistiques'
import type { StatistiquesMediateursData } from '@/components/coop/Statistiques/types'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'

export default function StatistiquesPageContent({ libellesFiltres, statistiquesPromise, titre }: Props) {
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
    totalCounts,
  } = statistiques

  return (
    <>
      <div className="fr-no-print">
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
      <PrintStatistiques filtres={libellesFiltres} statistiques={statistiques} titre={titre} />
    </>
  )
}

type Props = Readonly<{
  libellesFiltres: ReadonlyArray<Readonly<{ cle: string; libelle: string }>>
  statistiquesPromise: Promise<ErrorViewModel | StatistiquesMediateursData>
  titre: string
}>
