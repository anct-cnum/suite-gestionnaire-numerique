'use client'

// Adapté de la Coop : apps/web/src/app/coop/(sidemenu-layout)/mes-statistiques/_sections/StatistiquesBeneficiairesPrint.tsx
import { AccompagnementPieChart } from '../_components/AccompagnementPieChart'
import ProgressBar from '../_components/ProgressBar'
import { QuantifiedShareLegend } from '../_components/QuantifiedShareLegend'
import { QuantifiedShareList } from '../_components/QuantifiedShareList'
import { communeColor, genresColors, statusColors, tranchesAgeColors } from '../colors'
import type { BeneficiairesStatsWithCommunes, BeneficiaireStats } from '../types'

const toProgress = ({ label, count, proportion }: { label: string; count?: number; proportion: number }) => ({
  label,
  count,
  percentage: proportion,
})

export const StatistiquesBeneficiairesPrint = ({
  beneficiaires,
}: {
  beneficiaires: BeneficiairesStatsWithCommunes | BeneficiaireStats
}) => (
  <>
    <div className="print-bloc-insecable">
      <h2 className="fr-h3">Statistiques sur les bénéficiaires</h2>
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Genres</h3>
      <div className="fr-flex fr-align-items-center">
        <AccompagnementPieChart
          size={128}
          data={beneficiaires.genres}
          colors={genresColors}
          isAnimationActive={false}
        />
        <QuantifiedShareLegend className="fr-pl-3w" quantifiedShares={beneficiaires.genres} colors={genresColors} />
      </div>
    </div>
    <div className="print-bloc-insecable">
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Tranches d&apos;âge</h3>
      <div>
        <div className="fr-mr-3w fr-mb-2w">
          <ProgressBar size="large" progress={beneficiaires.trancheAges.map(toProgress)} colors={tranchesAgeColors} />
        </div>
        <QuantifiedShareLegend quantifiedShares={beneficiaires.trancheAges} colors={tranchesAgeColors} />
      </div>
    </div>
    <div className="print-bloc-insecable">
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Statuts</h3>
      <div className="fr-mr-3w fr-mb-2w">
        <ProgressBar size="large" progress={beneficiaires.statutsSocial.map(toProgress)} colors={statusColors} />
      </div>
      <QuantifiedShareLegend quantifiedShares={beneficiaires.statutsSocial} colors={statusColors} />
    </div>
    {'communes' in beneficiaires && beneficiaires.communes.length > 0 && (
      <>
        <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Commune de résidence des bénéficiaires</h3>
        <QuantifiedShareList order="desc" quantifiedShares={beneficiaires.communes} color={communeColor} />
      </>
    )}
  </>
)
