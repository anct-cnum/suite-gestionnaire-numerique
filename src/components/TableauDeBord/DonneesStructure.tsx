'use client'

import { ReactElement } from 'react'

import Bar from '../shared/Bar/Bar'
import TitleIcon from '../shared/TitleIcon/TitleIcon'

export default function DonneesStructure({ viewModel }: Props): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
      <div className="fr-col-12 fr-col-md-6">
        <div className="background-blue-france fr-p-3w border-radius fr-mb-2w">
          <div className="fr-grid-row fr-grid-row--middle fr-mb-1w">
            <div className="background-white fr-p-1-5v border-radius fr-mr-2w">
              <span aria-hidden="true" className="fr-icon-map-pin-2-line color-blue-france" />
            </div>
            <div className="fr-h2 fr-m-0">{viewModel.nombreLieux}</div>
          </div>
          <div className="font-weight-500">Lieux d&apos;inclusion numérique</div>
          <div className="fr-text--xs color-blue-france fr-mb-0">gérés par votre structure</div>
        </div>
        <div className="background-blue-france fr-p-3w border-radius">
          <div className="fr-grid-row fr-grid-row--middle fr-mb-1w">
            <div className="background-white fr-p-1-5v border-radius fr-mr-2w">
              <span aria-hidden="true" className="fr-icon-team-line color-blue-france" />
            </div>
            <div className="fr-h2 fr-m-0">{viewModel.nombreMediateurs}</div>
          </div>
          <div className="font-weight-500">Médiateurs et aidants numériques</div>
          <div className="fr-text--xs color-blue-france fr-mb-0">gérés par votre structure</div>
        </div>
      </div>
      <div className="fr-col-12 fr-col-md-6">
        <div className="background-blue-france fr-p-3w border-radius" style={{ height: '100%' }}>
          <div className="fr-grid-row fr-grid-row--middle fr-mb-1w">
            <TitleIcon background="white" icon="service-line" />
            <div className="fr-h2 fr-m-0 fr-ml-2w">{viewModel.accompagnements.total}</div>
          </div>
          <div className="font-weight-500">Accompagnements des 6 derniers mois</div>
          <div className="fr-text--xs color-blue-france fr-mb-0">Total cumulé des dispositifs</div>
          {viewModel.accompagnements.repartition.length > 0 ? (
            <div className="fr-mt-3w">
              <Bar
                backgroundColor={viewModel.accompagnements.repartition.map((_, index) =>
                  index === viewModel.accompagnements.repartition.length - 1 ? '#000091' : '#CACAFB'
                )}
                data={viewModel.accompagnements.repartition.map((item) => item.nombre)}
                labels={viewModel.accompagnements.repartition.map((item) => item.mois)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export type DonneesStructureViewModel = Readonly<{
  accompagnements: Readonly<{
    repartition: ReadonlyArray<
      Readonly<{
        mois: string
        nombre: number
      }>
    >
    total: string
  }>
  nombreLieux: string
  nombreMediateurs: string
}>

type Props = Readonly<{
  viewModel: DonneesStructureViewModel
}>
