'use client'
import { ReactElement, useEffect, useRef, useState } from 'react'

import CarteFranceAvecInsets, { getDepartementFragiliteColor } from '../../shared/Carte/CarteFranceAvecInsets'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'

export default function CarteFragiliteFrance({
  departementsFragilite,
}: Props): ReactElement {
  const [isReady, setIsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) {return undefined}

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

  if (isErrorViewModel(departementsFragilite)) {
    return (
      <div
        className="fr-col-8 background-blue-france"
        ref={containerRef}
        style={{ padding: 0 }}
      >
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
                <span>
                  {' '}
                  Indice de Fragilité numérique - France
                </span>
                <Information label="L'Indice de Fragilité Numérique est issu des données de la Mednum calculées en 2021" />
              </div>
            </div>
          </div>
          <div style={{ alignItems: 'center', display: 'flex', flex: 1, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <TitleIcon
                background="white"
                icon="error-warning-line"
              />
              <div className="fr-text--sm color-blue-france fr-mt-2w">
                {departementsFragilite.message}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Transformer les données pour le composant CarteFrance
  const departementsData = departementsFragilite.map(dept => ({
    codeDepartement: dept.codeDepartement,
    couleur: getDepartementFragiliteColor(dept.score),
    score: dept.score,
  }))

  return (
    <div
      className="fr-col-8 background-blue-france"
      ref={containerRef}
      style={{ padding: 0 }}
    >
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
              <span>
                {' '}
                Indice de Fragilité numérique - France
              </span>
              <Information label="L'Indice de Fragilité Numérique est issu des données de la Mednum calculées en 2021" />
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {/* On attend que le composant chart soit prêt avant de charger la carte */}
          {isReady ?
            <CarteFranceAvecInsets
              departementsFragilite={departementsData}
            /> : null}
        </div>
      </div>
    </div>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | ReadonlyArray<DepartementFragilite>)
  :viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type DepartementFragilite = Readonly<{
  codeDepartement: string
  score: number
}>

type Props = Readonly<{
  departementsFragilite: ErrorViewModel | ReadonlyArray<DepartementFragilite>
}>