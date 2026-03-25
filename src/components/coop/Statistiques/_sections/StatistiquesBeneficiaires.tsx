'use client'

import { AccompagnementPieChart } from '../_components/AccompagnementPieChart'
import ProgressBar from '../_components/ProgressBar'
import { QuantifiedShareLegend } from '../_components/QuantifiedShareLegend'
import { QuantifiedShareList } from '../_components/QuantifiedShareList'
import {
  communeColor,
  genresColors,
  statusColors,
  tranchesAgeColors,
} from '../colors'
import type { BeneficiairesStatsWithCommunes, BeneficiaireStats } from '../types'

const toProgress = ({
  label,
  count,
  proportion,
}: {
  label: string
  count?: number
  proportion: number
}) => ({
  label,
  count,
  percentage: proportion,
})

export const StatistiquesBeneficiaires = ({
  beneficiaires,
}: {
  beneficiaires: BeneficiairesStatsWithCommunes | BeneficiaireStats
}) => (
  <>
    <h3 className="fr-h5 fr-text-mention--grey">
      <span className="ri-user-heart-line fr-mr-1w" aria-hidden />
      Statistiques sur les bénéficiaires
    </h3>
    <div className="fr-border fr-p-4w fr-background-default--grey fr-border-radius--16 fr-position-relative">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-lg-6 fr-col-12">
          <h4 className="fr-text--md fr-text--nowrap fr-mb-4v">Genres</h4>
          <QuantifiedShareLegend
            quantifiedShares={beneficiaires.genres}
            colors={genresColors}
          />
        </div>
        <div className="fr-col-lg-6 fr-col-12">
          <AccompagnementPieChart
            size={225}
            width={52}
            className="fr-mx-auto"
            data={beneficiaires.genres}
            colors={genresColors}
            half
          />
        </div>
      </div>
      <hr className="fr-separator-1px fr-my-5w" />
      <div className="fr-flex fr-flex-wrap fr-flex-gap-12v">
        <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
          <h4 className="fr-text--md fr-text--nowrap fr-mb-4v">
            Tranches d'âge
          </h4>
          <div className="fr-mb-4v">
            <ProgressBar
              size="large"
              progress={beneficiaires.trancheAges.map(toProgress)}
              colors={tranchesAgeColors}
              tooltipKey="tranches-age"
            />
          </div>
          <QuantifiedShareLegend
            quantifiedShares={beneficiaires.trancheAges}
            colors={tranchesAgeColors}
          />
        </div>
        <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
          <h4 className="fr-text--md fr-text--nowrap fr-mb-4v">Statuts</h4>
          <div className="fr-mb-4v">
            <ProgressBar
              size="large"
              progress={beneficiaires.statutsSocial.map(toProgress)}
              colors={statusColors}
              tooltipKey="status-beneficiaires"
            />
          </div>
          <QuantifiedShareLegend
            quantifiedShares={beneficiaires.statutsSocial}
            colors={statusColors}
          />
        </div>
      </div>
      {'communes' in beneficiaires && (
        <>
          <hr className="fr-separator-1px fr-my-5w" />
          <h4 className="fr-text--md fr-mb-4v">
            Commune de résidence des bénéficiaires
          </h4>
          {beneficiaires.communes.length === 0 ||
          beneficiaires.communes.every((c) => c.count === 0) ? (
            <div className="fr-text--center fr-background-alt--blue-france fr-p-12v fr-border-radius--8">
              Aucune commune de résidence renseignée
            </div>
          ) : (
            <>
              <div className="fr-text--bold fr-text--uppercase fr-text--xs fr-text-mention--grey fr-mb-1w">
                Commune
              </div>
              <QuantifiedShareList
                order="desc"
                limit={{
                  showLabel: 'Voir toutes les communes',
                  hideLabel: 'Réduire',
                  count: 5,
                }}
                quantifiedShares={beneficiaires.communes}
                oneLineLabel
                color={communeColor}
                style={{
                  label: {
                    minWidth: '244px',
                  },
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  </>
)
