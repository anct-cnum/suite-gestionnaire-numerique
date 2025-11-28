
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
import Information from '@/components/shared/Information/Information'

const toProgress = ({
  count,
  label,
  proportion,
}: {
  count?: number
  label: string
  proportion: number
}) => ({
  count,
  label,
  percentage: proportion,
})

export function StatistiquesBeneficiaires({
  beneficiaires,
}: {
  readonly beneficiaires: BeneficiairesStatsWithCommunes | BeneficiaireStats
}) {
  return (<>
    <h2 className="fr-h5 fr-text-mention--grey">
      <span
        aria-hidden
        className="fr-icon-user-heart-line fr-mr-1w"
      />
      Statistiques sur les bénéficiaires
    </h2>
    <div
      className="fr-p-4w fr-border-radius--16"
      style={{ border: '1px solid var(--border-default-grey)' }}
    >
      <div>
        <h3 className="fr-text--lg fr-mb-0 fr-mb-3w">
          <span>
            Genres
          </span>
          <Information label="Bénéficiaires suivis et anonymes dont le genre a été complété." />
        </h3>
        <div
          style={{
            alignItems: 'center',
            alignSelf: 'stretch',
            display: 'flex',
            gap: '64px',
          }}
        >
          <div style={{ flex: 1 }}>
            <QuantifiedShareLegend
              colors={genresColors}
              quantifiedShares={beneficiaires.genres}
            />
          </div>
          <div style={{ alignItems: 'center', display: 'flex', flex: 1, justifyContent: 'center' }}>
            <AccompagnementPieChart
              colors={genresColors}
              data={beneficiaires.genres}
              size={140}
            />
          </div>
        </div>
      </div>
      <hr className="fr-separator-1px fr-my-5w" />
      <div
        style={{
          alignItems: 'flex-start',
          alignSelf: 'stretch',
          display: 'flex',
          gap: '64px',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            flex: '1 0 0',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h3 className="fr-text--lg fr-mb-0">
            <span>
              Tranches d'âge
            </span>
            <Information label="Bénéficiaires suivis et anonymes dont la tranche d'âge a été complétée." />
          </h3>
          <ProgressBar
            colors={tranchesAgeColors}
            progress={beneficiaires.trancheAges.map(toProgress)}
            style={{ height: '24px' }}
            tooltopKey="tranches-age"
          />
          <QuantifiedShareLegend
            colors={tranchesAgeColors}
            quantifiedShares={beneficiaires.trancheAges}
          />
        </div>
        <div
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            flex: '1 0 0',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h3 className="fr-text--lg fr-mb-0">
            <span>
              Statuts
            </span>
            <Information label="Bénéficiaires suivis et anonymes dont le statut a été complété." />
          </h3>
          <ProgressBar
            colors={statusColors}
            progress={beneficiaires.statutsSocial.map(toProgress)}
            style={{ height: '24px' }}
            tooltopKey="status-beneficiaires"
          />
          <QuantifiedShareLegend
            colors={statusColors}
            quantifiedShares={beneficiaires.statutsSocial}
          />
        </div>
      </div>

      {'communes' in beneficiaires && beneficiaires.communes.length > 0 && (
        <>
          <hr className="fr-separator-1px fr-my-5w" />
          <div className="fr-mb-3w">
            <h3 className="fr-text--lg fr-mb-0">
              <span>
                Commune de résidence des bénéficiaires
              </span>
              <Information label="Bénéficiaires suivis et anonymes dont la commune de résidence a été complétée." />
            </h3>
          </div>

          <div className="fr-text--bold fr-text--uppercase fr-text--sm fr-text-mention--grey fr-mb-1w">
            Commune
          </div>
          <QuantifiedShareList
            color={communeColor}
            limit={{
              count: 5,
              hideLabel: 'Réduire',
              showLabel: 'Voir toutes les communes',
            }}
            oneLineLabel
            order="desc"
            quantifiedShares={beneficiaires.communes}
            style={{
              label: {
                minWidth: '244px',
              },
            }}
          />
        </>
      )}
    </div>
          </>)
}
