'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl'
import { useState } from 'react'
import { AccompagnementBarChart } from '../_components/AccompagnementBarChart'
import type { AccompagnementCountByPeriod, AccompagnementsStats } from '../types'
import { numberToString, sPluriel } from '../utils'

export const StatistiquesGenerales = ({
  totalCounts,
  accompagnementsParMois,
  accompagnementsParJour,
}: {
  accompagnementsParJour: AccompagnementCountByPeriod
  accompagnementsParMois: AccompagnementCountByPeriod
  totalCounts: AccompagnementsStats
}) => {
  const [isAccompagnementCountByMonth, setIsAccompagnementCountByMonth] = useState(true)

  return (
    <div>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mb-6v">
        <h3 className="fr-h5 fr-text-mention--grey fr-mb-0">
          <span className="ri-line-chart-line fr-mr-1w" aria-hidden />
          Statistiques générales sur les accompagnements
        </h3>
      </div>
      <div className="fr-grid-row fr-flex-gap-6v fr-background-default--grey fr-border-radius--16">
        <div className="fr-flex fr-direction-column fr-flex-gap-6v fr-col-xl-4 fr-col-12">
          <div className="fr-px-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel fr-width-full">
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
              <span className="fr-h2 fr-mb-0">{numberToString(totalCounts.accompagnements.total)}</span>
              <span
                className="ri-service-line ri-2x"
                style={{
                  color: 'var(--brown-caramel-sun-425-moon-901-hover)',
                }}
                aria-hidden
              />
            </div>
            <div className="fr-text--bold fr-text--sm fr-mb-0 fr-mt-1v">
              Accompagnement{sPluriel(totalCounts.accompagnements.total)}{' '}
              <Button
                className="fr-px-2v"
                title="Plus d'information à propos des accompagnements"
                priority="tertiary no outline"
                size="small"
                type="button"
                aria-describedby="tooltip-accompagnements"
              >
                <span className="ri-information-line fr-text--lg" aria-hidden />
              </Button>
              <span
                className="fr-tooltip fr-placement fr-text--regular"
                id="tooltip-accompagnements"
                role="tooltip"
                aria-hidden
              >
                {numberToString(totalCounts.accompagnements.total)} accompagnements au total dont&nbsp;:
                <ul>
                  <li>
                    {numberToString(totalCounts.accompagnements.individuels.total)} accompagnement
                    {sPluriel(totalCounts.accompagnements.individuels.total)} individuel
                    {sPluriel(totalCounts.accompagnements.individuels.total)}
                  </li>
                  <li>
                    {numberToString(totalCounts.activites.collectifs.participants)} participation
                    {sPluriel(totalCounts.activites.collectifs.participants)} lors de{' '}
                    {numberToString(totalCounts.activites.collectifs.total)} ateliers*
                  </li>
                </ul>
                *Les ateliers collectifs comptent pour 1 accompagnement par participant. Ex&nbsp;: Un atelier collectif
                avec 10 participants compte pour 10 accompagnements.
              </span>
            </div>
          </div>
          <div className="fr-px-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel fr-flex-grow-1">
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
              <span className="fr-h2 fr-mb-0 fr-text--nowrap">{numberToString(totalCounts.beneficiaires.total)}</span>
              <span
                className="ri-user-heart-line ri-2x"
                style={{
                  color: 'var(--brown-caramel-sun-425-moon-901-hover)',
                }}
                aria-hidden
              />
            </div>
            <div className="fr-mt-2v">
              <div className="fr-text--sm fr-text--bold fr-mb-0">
                Bénéficiaire{sPluriel(totalCounts.beneficiaires.total)} accompagné
                {sPluriel(totalCounts.beneficiaires.total)}
              </div>
            </div>
            <div className="fr-text-mention--grey fr-text--sm fr-mb-0 fr-mt-4v">
              <div>
                <strong>{numberToString(totalCounts.beneficiaires.suivis)}</strong> bénéficiaire
                {sPluriel(totalCounts.beneficiaires.suivis)} suivi
                {sPluriel(totalCounts.beneficiaires.suivis)}
              </div>
              <div className="fr-whitespace-nowrap">
                <strong>{numberToString(totalCounts.beneficiaires.anonymes)}</strong> bénéficiaire
                {sPluriel(totalCounts.beneficiaires.anonymes)} anonyme
                {sPluriel(totalCounts.beneficiaires.anonymes)}
                <Button
                  className="fr-px-1v fr-ml-1v"
                  title="Plus d'information à propos des bénéficiaires anonymes"
                  priority="tertiary no outline"
                  size="small"
                  type="button"
                  aria-describedby="tooltip-nombre-beneficiaires-anonymes"
                >
                  <span className="ri-information-line fr-text--lg" aria-hidden />
                </Button>
                <span
                  className="fr-tooltip fr-placement"
                  id="tooltip-nombre-beneficiaires-anonymes"
                  role="tooltip"
                  aria-hidden
                >
                  Les bénéficiaires anonymes sont comptabilisés comme 1 nouveau bénéficiaire à chaque accompagnement.
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="fr-col fr-border fr-pt-6v fr-pb-4v fr-px-8v fr-border-radius--16 fr-flex fr-direction-column">
          <div className="fr-mb-3w fr-flex fr-flex-wrap fr-justify-content-space-between fr-align-items-center fr-flex-gap-2v">
            <div className="fr-mb-0 fr-flex fr-align-items-center fr-text--nowrap">
              <h4 className="fr-text--lg fr-mb-0">Nombre d'accompagnements</h4>
              <Button
                className="fr-px-1v fr-ml-1v"
                title="Plus d'information à propos du nombre d'accompagnements"
                priority="tertiary no outline"
                size="small"
                type="button"
                aria-describedby="tooltip-nombre-accompagnements"
              >
                <span className="ri-information-line fr-text--lg" aria-hidden />
              </Button>
              <span className="fr-tooltip fr-placement" id="tooltip-nombre-accompagnements" role="tooltip" aria-hidden>
                Le nombre d'accompagnements correspond à la somme des 2 types d'activités enregistrées&nbsp;:
                accompagnement individuel et atelier collectif.
                <br />
                <br />À noter&nbsp;: Les ateliers collectifs comptent pour 1 accompagnement par participant. Ex&nbsp;:
                Un atelier collectif avec 10 participants compte pour 10 accompagnements.
              </span>
            </div>
            <SegmentedControl
              className="fr-ml-auto"
              hideLegend
              small
              legend="Bascule entre entre les périodes"
              segments={[
                {
                  label: 'Par mois',
                  nativeInputProps: {
                    checked: isAccompagnementCountByMonth,
                    onChange: () => setIsAccompagnementCountByMonth(true),
                  },
                },
                {
                  label: 'Par jour',
                  nativeInputProps: {
                    checked: !isAccompagnementCountByMonth,
                    onChange: () => setIsAccompagnementCountByMonth(false),
                  },
                },
              ]}
            />
          </div>
          <div className="fr-flex-grow-1">
            <AccompagnementBarChart
              data={isAccompagnementCountByMonth ? accompagnementsParMois : accompagnementsParJour}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
