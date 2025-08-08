'use client'
import { ReactElement, useEffect, useRef, useState } from 'react'

import CarteFranceAvecInsets, { getDepartementFragiliteColor } from '../../shared/Carte/CarteFranceAvecInsets'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
import { CONFIANCE_COLORS } from '@/presenters/tableauDeBord/indiceFragilitePresenter'

export default function CarteFragiliteFrance({
  departementsFragilite,
  departementsConfiance,
}: Props): ReactElement {
  const [isReady, setIsReady] = useState(false)
  const [activeIndex, setActiveIndex] = useState<'fragilite' | 'confiance'>('confiance')
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

  const currentData = activeIndex === 'fragilite' ? departementsFragilite : (departementsConfiance || departementsFragilite)

  if (isErrorViewModel(currentData)) {
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
          <div style={{ padding: '1rem', paddingTop: '2rem', position: 'relative', zIndex: 10 }}>
            <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', width: '80%' }}>
                <div className="fr-btns-group fr-btns-group--inline-sm" style={{ width: '100%' }}>
                  <button
                    className={`fr-btn ${activeIndex === 'confiance' ? '' : 'fr-btn--secondary'}`}
                    onClick={() => setActiveIndex('confiance')}
                    style={{ borderRadius: activeIndex === 'fragilite' ? '0.25rem 0 0 0.25rem' : '0.25rem', flex: 1 }}
                    type="button"
                  >
                    Indice de confiance
                  </button>
                  <button
                    className={`fr-btn ${activeIndex === 'fragilite' ? '' : 'fr-btn--secondary'}`}
                    onClick={() => setActiveIndex('fragilite')}
                    style={{ borderLeft: 'none', borderRadius: activeIndex === 'confiance' ? '0 0.25rem 0.25rem 0' : '0.25rem', flex: 1 }}
                    type="button"
                  >
                    Indice de fragilité numérique
                  </button>
                </div>
              </div>
              {activeIndex === 'fragilite' && (
                <div className="font-weight-700 color-blue-france">
                  <Information label="L'Indice de Fragilité Numérique est issu des données de la Mednum calculées en 2021" />
                </div>
              )}
            </div>
          </div>
          <div style={{ alignItems: 'center', display: 'flex', flex: 1, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <TitleIcon
                background="white"
                icon="error-warning-line"
              />
              <div className="fr-text--sm color-blue-france fr-mt-2w">
                {currentData.message}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Transformer les données pour le composant CarteFrance
  const departementsData = activeIndex === 'fragilite' 
    ? (departementsFragilite as ReadonlyArray<DepartementFragilite>).map(dept => ({
        codeDepartement: dept.codeDepartement,
        couleur: getDepartementFragiliteColor(dept.score),
        score: dept.score,
      }))
    : departementsConfiance && !isErrorViewModel(departementsConfiance)
    ? (departementsConfiance as ReadonlyArray<DepartementConfiance>).map(dept => ({
        codeDepartement: dept.codeDepartement,
        couleur: CONFIANCE_COLORS[dept.indiceConfiance as keyof typeof CONFIANCE_COLORS] || '#CECECE',
        score: dept.indiceConfiance,
      }))
    : []

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
        <div style={{ padding: '1rem', paddingTop: '2rem', position: 'relative', zIndex: 10 }}>
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', width: '80%' }}>
              <div className="fr-btns-group fr-btns-group--inline-sm" style={{ width: '100%' }}>
                <button
                  className={`fr-btn ${activeIndex === 'confiance' ? '' : 'fr-btn--secondary'}`}
                  onClick={() => setActiveIndex('confiance')}
                  style={{ borderRadius: activeIndex === 'fragilite' ? '0.25rem 0 0 0.25rem' : '0.25rem', flex: 1 }}
                  type="button"
                >
                  Indice de confiance
                </button>
                <button
                  className={`fr-btn ${activeIndex === 'fragilite' ? '' : 'fr-btn--secondary'}`}
                  onClick={() => setActiveIndex('fragilite')}
                  style={{ borderLeft: 'none', borderRadius: activeIndex === 'confiance' ? '0 0.25rem 0.25rem 0' : '0.25rem', flex: 1 }}
                  type="button"
                >
                  Indice de fragilité numérique
                </button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {/* On attend que le composant chart soit prêt avant de charger la carte */}
          {isReady ?
            <CarteFranceAvecInsets
              departementsFragilite={departementsData}
              legendType={activeIndex}
            /> : null}
        </div>
      </div>
    </div>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | ReadonlyArray<DepartementFragilite> | ReadonlyArray<DepartementConfiance>)
  :viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type DepartementFragilite = Readonly<{
  codeDepartement: string
  score: number
}>

type DepartementConfiance = Readonly<{
  codeDepartement: string
  couleur: string
  indiceConfiance: number
}>

type Props = Readonly<{
  departementsFragilite: ErrorViewModel | ReadonlyArray<DepartementFragilite>
  departementsConfiance?: ErrorViewModel | ReadonlyArray<DepartementConfiance>
}>