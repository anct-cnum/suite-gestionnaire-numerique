'use client'

import classNames from 'classnames'
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react'

import styles from './CarteFragilite.module.css'
import CarteFranceAvecInsets from '../../shared/Carte/CarteFranceAvecInsets'
import Legend from '../../shared/Carte/Legend'
import LegendConfiance from '../../shared/Carte/LegendConfiance'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import {
  type DepartementConfiance,
  type DepartementFragilite,
  type StatistiquesIcp,
  transformerDonneesCarteConfiance,
  transformerDonneesCarteFrance,
} from '@/presenters/tableauDeBord/indicesPresenter'

export default function CarteIndicesFrance({
  departementsConfiance,
  departementsFragilite,
  statistiquesIcp,
}: Props): ReactElement {
  const [isReady, setIsReady] = useState(false)
  const [ongletActif, setOngletActif] = useState<Onglet>('confiance')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return undefined
    }

    let resizeTimeout: NodeJS.Timeout

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsReady(true)
      }, 200)
    })

    resizeObserver.observe(containerRef.current)

    return (): void => {
      resizeObserver.disconnect()
      clearTimeout(resizeTimeout)
    }
  }, [])

  const isFragiliteError = isErrorViewModel(departementsFragilite)

  const donneesCarte = useMemo(() => {
    if (ongletActif === 'confiance' && departementsConfiance) {
      return transformerDonneesCarteConfiance(departementsConfiance)
    }
    if (!isFragiliteError) {
      return transformerDonneesCarteFrance(departementsFragilite)
    }
    return []
  }, [departementsConfiance, departementsFragilite, isFragiliteError, ongletActif])

  if (isFragiliteError && !departementsConfiance) {
    return (
      <div
        className={classNames('fr-col-12 fr-col-xl-8 background-blue-france', styles.carteContainer)}
        ref={containerRef}
      >
        <div className={classNames('fr-p-0w', styles.carteContent)}>
          <div>
            <div className="font-weight-700 color-blue-france">
              <span>Indice de Fragilité numérique</span>
              <Information>
                <p className="fr-mb-0">
                  L&apos;Indice de Fragilité Numérique est issu des données de la Mednum calculées en 2021
                </p>
              </Information>
            </div>
          </div>
          <div className={styles.carteErrorCenter}>
            <div style={{ textAlign: 'center' }}>
              <TitleIcon background="white" icon="error-warning-line" />
              <div className="fr-text--sm color-blue-france fr-mt-2w">{departementsFragilite.message}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={classNames('fr-col-12 fr-col-xl-8 background-blue-france', styles.carteContainer)}
      ref={containerRef}
    >
      <div className={classNames('fr-p-0w', styles.carteContent)}>
        <div>
          {departementsConfiance ? (
            <OngletsCarte ongletActif={ongletActif} setOngletActif={setOngletActif} />
          ) : (
            <div className="font-weight-700 color-blue-france">
              <span>Indice de Fragilité numérique</span>
              <Information>
                <p className="fr-mb-0">
                  L&apos;Indice de Fragilité Numérique est issu des données de la Mednum calculées en 2021
                </p>
              </Information>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {isReady ? (
            <CarteFranceAvecInsets
              donneesDepartements={donneesCarte}
              legend={
                ongletActif === 'confiance' && statistiquesIcp ? (
                  <LegendConfiance statistiques={statistiquesIcp} />
                ) : (
                  <Legend />
                )
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

type Onglet = 'confiance' | 'fragilite'

function OngletsCarte({
  ongletActif,
  setOngletActif,
}: Readonly<{
  ongletActif: Onglet
  setOngletActif(onglet: Onglet): void
}>): ReactElement {
  return (
    <div className={styles.ongletsContainer}>
      <button
        className={classNames(styles.onglet, styles.ongletGauche, {
          [styles.ongletActif]: ongletActif === 'confiance',
        })}
        onClick={() => {
          setOngletActif('confiance')
        }}
        type="button"
      >
        Indice de confiance
      </button>
      <button
        className={classNames(styles.onglet, styles.ongletDroite, {
          [styles.ongletActif]: ongletActif === 'fragilite',
        })}
        onClick={() => {
          setOngletActif('fragilite')
        }}
        type="button"
      >
        Indice de fragilité numérique
      </button>
    </div>
  )
}

function isErrorViewModel(
  viewModel: ErrorViewModel | ReadonlyArray<DepartementFragilite>
): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  departementsConfiance?: ReadonlyArray<DepartementConfiance>
  departementsFragilite: ErrorViewModel | ReadonlyArray<DepartementFragilite>
  statistiquesIcp?: StatistiquesIcp
}>
