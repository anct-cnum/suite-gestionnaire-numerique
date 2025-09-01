import { ReactElement, ReactNode } from 'react'

import { formaterEnNombreFrancais } from '@/presenters/shared/number'
import { parseTextWithBold } from '@/shared/textFormatting'

export default function ListeAidantsMediateurInfos({ viewModel }: Props): ReactElement {
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
            indicateur: formaterEnNombreFrancais(viewModel.totalAccompagnements),
            legends: 'sur les 30 derniers jours',
          })}
          {renderAidantsMediateursInfoCard({
            description: 'Bénéficiaires accompagnés',
            indicateur: formaterEnNombreFrancais(viewModel.totalBeneficiaires),
            legends: 'sur les 30 derniers jours',
          })}
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
  beneficiairesPromise: Promise<number>
  viewModel: {
    totalAccompagnements: number
    totalActeursNumerique: number
    totalConseillersNumerique: number
  }
}>
