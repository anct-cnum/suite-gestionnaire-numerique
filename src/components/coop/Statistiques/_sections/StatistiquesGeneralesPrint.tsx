'use client'

// Adapté de la Coop : apps/web/src/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesGeneralesPrint.tsx
import { AccompagnementBarChart } from '../_components/AccompagnementBarChart'
import type { AccompagnementCountByPeriod, AccompagnementsStats } from '../types'
import { numberToString, sPluriel } from '../utils'

const barChartHeight = 280

export const StatistiquesGeneralesPrint = ({
  accompagnementsParJour,
  accompagnementsParMois,
  totalCounts,
}: {
  accompagnementsParJour: AccompagnementCountByPeriod
  accompagnementsParMois: AccompagnementCountByPeriod
  totalCounts: AccompagnementsStats
}) => (
  <>
    <div className="print-bloc-insecable">
      <h2 className="fr-h3">Statistiques générales sur les accompagnements</h2>
      <h3 className="fr-h5">Accompagnements et bénéficiaires</h3>
      <p>
        <strong>
          {numberToString(totalCounts.beneficiaires.total)} bénéficiaire{sPluriel(totalCounts.beneficiaires.total)}
        </strong>{' '}
        accompagné{sPluriel(totalCounts.beneficiaires.total)}&nbsp;:{' '}
        <strong>
          {numberToString(totalCounts.beneficiaires.suivis)} bénéficiaire{sPluriel(totalCounts.beneficiaires.suivis)}{' '}
          suivi{sPluriel(totalCounts.beneficiaires.suivis)}
        </strong>{' '}
        et{' '}
        <strong>
          {numberToString(totalCounts.beneficiaires.anonymes)} bénéficiaire
          {sPluriel(totalCounts.beneficiaires.anonymes)} anonyme{sPluriel(totalCounts.beneficiaires.anonymes)}
        </strong>
      </p>
      <p>
        <strong>
          {numberToString(totalCounts.accompagnements.total)} accompagnement
          {sPluriel(totalCounts.accompagnements.total)}
        </strong>{' '}
        au total
        <br />
        <small className="fr-mb-6v fr-display-block" role="note">
          *Les ateliers collectifs comptent pour 1 accompagnement par participant. Ex&nbsp;: Un atelier collectif avec
          10 participants compte pour 10 accompagnements.
        </small>
      </p>
    </div>
    <div className="print-bloc-insecable">
      <h3 className="fr-h5 fr-mt-6v">Nombre d&apos;accompagnements par mois</h3>
      <div style={{ height: barChartHeight }}>
        <AccompagnementBarChart data={accompagnementsParMois} />
      </div>
    </div>
    <div className="print-bloc-insecable">
      <h3 className="fr-h5 fr-mt-6v">Nombre d&apos;accompagnements par jour</h3>
      <div style={{ height: barChartHeight }}>
        <AccompagnementBarChart data={accompagnementsParJour} />
      </div>
    </div>
  </>
)
