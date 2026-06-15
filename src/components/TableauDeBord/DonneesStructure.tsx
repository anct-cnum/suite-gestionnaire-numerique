'use client'

import classNames from 'classnames'
import { ReactElement } from 'react'

import styles from './TableauDeBord.module.css'
import BarHistogramme from '../shared/BarHistogramme/BarHistogramme'
import TitleIcon from '../shared/TitleIcon/TitleIcon'

export default function DonneesStructure({ viewModel }: Props): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
      <div className="fr-col-12 fr-col-md-6" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="background-blue-france fr-p-3w border-radius fr-mb-1w" style={{ flex: 1 }}>
          <div className="fr-grid-row fr-grid-row--middle fr-mb-1v">
            <div className="background-white fr-p-3v border-radius fr-mr-3v">
              <span aria-hidden="true" className="fr-icon-map-pin-2-line color-blue-france" />
            </div>
            <div className={classNames(styles.indicateurValeur, 'fr-m-0')}>{viewModel.nombreLieux}</div>
          </div>
          <div className="font-weight-500 fr-mt-1v">Lieux d&apos;inclusion numérique</div>
          <div className="fr-text--xs color-blue-france fr-mb-0">gérés par votre structure</div>
        </div>
        <div className="background-blue-france fr-p-3w border-radius" style={{ flex: 1 }}>
          <div className="fr-grid-row fr-grid-row--middle fr-mb-1v">
            <div className="background-white fr-p-3v border-radius fr-mr-3v">
              <span aria-hidden="true" className="fr-icon-team-line color-blue-france" />
            </div>
            <div className={classNames(styles.indicateurValeur, 'fr-m-0')}>{viewModel.nombreMediateurs}</div>
          </div>
          <div className="font-weight-500 fr-mt-1v">Médiateurs et aidants numériques</div>
          <div className="fr-text--xs color-blue-france fr-mb-0">gérés par votre structure</div>
        </div>
      </div>
      <div className="fr-col-12 fr-col-md-6">
        <div
          className="background-blue-france fr-p-3w border-radius"
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <div className="fr-grid-row fr-grid-row--middle fr-mb-1v">
            <TitleIcon background="white" icon="service-line" />
            <div className={classNames(styles.indicateurValeur, 'fr-m-0 fr-ml-2w')}>
              {viewModel.accompagnements.total}
            </div>
          </div>
          <div className="font-weight-500">Accompagnements des 6 derniers mois</div>
          <div className="fr-text--xs color-blue-france fr-mb-0">Total cumulé des dispositifs</div>
          {viewModel.accompagnements.repartition.length > 0 ? (
            <div className="fr-mt-3w" style={{ flex: 1, minHeight: 0 }}>
              <BarHistogramme
                backgroundColor={viewModel.accompagnements.repartition.map((item) =>
                  item.estMoisCourant ? '#000091' : '#CACAFB'
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
        estMoisCourant: boolean
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
