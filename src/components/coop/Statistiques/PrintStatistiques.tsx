'use client'

// Adapté de la Coop : apps/web/src/app/coop/(sidemenu-layout)/mes-statistiques/_components/PrintStatistiques.tsx
import { StatistiquesActivitesPrint } from './_sections/StatistiquesActivitesPrint'
import { StatistiquesBeneficiairesPrint } from './_sections/StatistiquesBeneficiairesPrint'
import { StatistiquesGeneralesPrint } from './_sections/StatistiquesGeneralesPrint'
import type { StatistiquesMediateursData } from './types'

export const PrintStatistiques = ({
  filtres,
  statistiques,
  titre,
}: {
  filtres: ReadonlyArray<Readonly<{ cle: string; libelle: string }>>
  statistiques: StatistiquesMediateursData
  titre: string
}) => (
  <div className="statistiques-print" aria-hidden>
    <h1 className="fr-h2 color-blue-france fr-my-2w">{titre}</h1>
    {filtres.length > 0 && (
      <section>
        <h2 className="fr-h3">Filtres activés</h2>
        <ul className="fr-tags-group">
          {filtres.map((filtre) => (
            <li className="fr-line-height-1" key={filtre.cle}>
              <span className="fr-tag fr-tag--sm">{filtre.libelle}</span>
            </li>
          ))}
        </ul>
      </section>
    )}
    <section className="fr-pt-6v">
      <StatistiquesGeneralesPrint
        accompagnementsParJour={statistiques.accompagnementsParJour}
        accompagnementsParMois={statistiques.accompagnementsParMois}
        totalCounts={statistiques.totalCounts}
      />
    </section>
    <section className="fr-pt-6v">
      <StatistiquesActivitesPrint
        activites={statistiques.activites}
        structures={statistiques.structures}
        totalCounts={statistiques.totalCounts}
      />
    </section>
    <section className="fr-pt-6v">
      <StatistiquesBeneficiairesPrint beneficiaires={statistiques.beneficiaires} />
    </section>
  </div>
)
