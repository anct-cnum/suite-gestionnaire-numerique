'use client'

import { ReactElement, useEffect, useRef, useState } from 'react'

import styles from './CarteFragilite.module.css'
import Carte, { TerritoireCarte } from '../../shared/Carte/Carte'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { CommuneFragilite, DepartementFragilite } from '@/presenters/tableauDeBord/indicesPresenter'

export default function CarteFragiliteDepartement({ fragilite, territoire }: Props): ReactElement {
  const [isReady, setIsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return undefined
    }

    let resizeTimeout: NodeJS.Timeout

    const resizeObserver = new ResizeObserver(() => {
      // Attendre que la taille se stabilise
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

  if (isErrorViewModel(fragilite)) {
    return (
      <div className={`fr-col-12 fr-col-xl-8 background-blue-france ${styles.carteContainer}`} ref={containerRef}>
        <div
          className="fr-p-0w"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: '100%',
          }}
        >
          <div style={{ padding: '1rem' }}>
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
              <div className="font-weight-700 color-blue-france">
                <span> Indice de Fragilité numérique</span>
                <Information>
                  <p className="fr-mb-0">
                    L&apos;Indice de Fragilité Numérique est issu des données de la <strong>Mednum</strong>, calculées
                    en <strong>2021.</strong>
                  </p>
                </Information>
              </div>
            </div>
          </div>
          <div style={{ alignItems: 'center', display: 'flex', flex: 1, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <TitleIcon background="white" icon="error-warning-line" />
              <div className="fr-text--sm color-blue-france fr-mt-2w">{fragilite.message}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fr-col-12 fr-col-xl-8 background-blue-france ${styles.carteContainer}`} ref={containerRef}>
      <div
        className="fr-p-0w"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          height: '100%',
        }}
      >
        <div style={{ padding: '1rem' }}>
          <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <div className="font-weight-700 color-blue-france">
              <span> Indice de Fragilité numérique</span>
              <Information>
                <p className="fr-mb-0">
                  L&apos;Indice de Fragilité Numérique est issu des données de la Mednum calculées en 2021
                </p>
              </Information>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {/* On attend que le composant chart soit prêt avant de charger la carte */}
          {isReady ? <Carte fragilite={fragilite} territoire={territoire} /> : null}
        </div>
      </div>
    </div>
  )
}

function isErrorViewModel(
  viewModel: ErrorViewModel | ReadonlyArray<CommuneFragilite | DepartementFragilite>
): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  fragilite: ErrorViewModel | ReadonlyArray<CommuneFragilite | DepartementFragilite>
  territoire: TerritoireCarte
}>
