import { ReactElement, ReactNode, Suspense } from 'react'

import BeneficiairesAsyncCard from './BeneficiairesAsyncCard'
import { parseTextWithBold } from '../../shared/textFormatting'
import AsyncLoaderErrorBoundary from '../AidantsMediateurs/GenericErrorBoundary'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { formaterEnNombreFrancais } from '@/presenters/shared/number'

export default function ListeAidantsMediateurInfos({
  hasActiveFilters,
  totalBeneficiairesPromise,
  viewModel,
}: Props): ReactElement {
  function renderAidantsMediateursInfoCard({
    description,
    indicateur,
    legends,
  }: AidantsMediateursInfoCard): ReactElement {
    return (
      <div
        className="fr-col-12 fr-col-md-4"
        style={{
          height: '7rem',
        }}
      >
        <div
          className="fr-background-alt--blue-france fr-p-2w"
          style={{
            borderRadius: '1rem',
            gap: '1rem',
            height: '7rem',
          }}
        >
          <div className="fr-h5 fr-text-title--blue-france fr-m-0">
            {indicateur}
          </div>
          <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
            {description}
          </div>
          <div className="fr-text--sm fr-text-title--blue-france fr-m-0">
            {typeof legends === 'string' ? parseTextWithBold(legends) : legends}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section
      aria-labelledby="ListeAidantsMediateursInfo"
      className="fr-pb-3w"
    >
      <div className="fr-container-fluid">
        <div className="fr-grid-row fr-grid-row--gutters">
          {renderAidantsMediateursInfoCard({
            description: 'Aidants et médiateurs numériques',
            indicateur: formaterEnNombreFrancais(viewModel.totalActeursNumerique),
            legends: `dont **${formaterEnNombreFrancais(viewModel.totalConseillersNumerique)} conseillers numériques**`,
          })}
          {renderAidantsMediateursInfoCard({
            description: 'Accompagnements',
            indicateur: hasActiveFilters ? '-' : formaterEnNombreFrancais(viewModel.totalAccompagnements),
            legends: 'sur les 30 derniers jours',
          })}
          <AsyncLoaderErrorBoundary
            fallback={
              <div
                className="fr-col-12 fr-col-md-4"
                style={{
                  height: '7rem',
                }}
              >
                <div
                  className="fr-background-alt--blue-france fr-p-2w"
                  style={{
                    borderRadius: '1rem',
                    gap: '1rem',
                    height: '7rem',
                  }}
                >
                  <div className="fr-h5 fr-text-title--blue-france fr-m-0">
                    -
                  </div>
                  <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
                    Bénéficiaires accompagnés
                  </div>
                  <div className="fr-text--sm fr-text-title--blue-france fr-m-0">
                    sur les 30 derniers jours
                  </div>
                </div>
              </div>
            }
          >
            <Suspense
              fallback={
                <div
                  className="fr-col-12 fr-col-md-4"
                  style={{
                    height: '7rem',
                  }}
                >
                  <div
                    className="fr-background-alt--blue-france fr-p-2w"
                    style={{
                      borderRadius: '1rem',
                      gap: '1rem',
                      height: '7rem',
                    }}
                  >
                    <div className="fr-h5 fr-text-title--blue-france fr-m-0">
                      ...
                    </div>
                    <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
                      Bénéficiaires accompagnés
                    </div>
                    <div className="fr-text--sm fr-text-title--blue-france fr-m-0">
                      sur les 30 derniers jours
                    </div>
                  </div>
                </div>
              }
            >
              <BeneficiairesAsyncCard
                hasActiveFilters={hasActiveFilters}
                totalBeneficiairesPromise={totalBeneficiairesPromise}
              />
            </Suspense>
          </AsyncLoaderErrorBoundary>
        </div>
      </div>
    </section>
  )
}

type AidantsMediateursInfoCard = Readonly<{
  description: string
  indicateur: string
  legends: ReactNode | string
}>

type Props = Readonly<{
  hasActiveFilters: boolean
  totalBeneficiairesPromise: Promise<ErrorViewModel | number>
  viewModel: {
    totalAccompagnements: number
    totalActeursNumerique: number
    totalConseillersNumerique: number
  }
}>
