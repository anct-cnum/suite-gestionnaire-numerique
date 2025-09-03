'use client'
import { ReactElement, useEffect, useRef, useState } from 'react'

import CarteFranceAvecInsets from '../../shared/Carte/CarteFranceAvecInsets'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { DepartementConfiance, DepartementFragilite, transformerDonneesCarteFrance } from '@/presenters/tableauDeBord/indicesPresenter'

export default function CarteIndicesFrance({
  departementsConfiance,
  departementsFragilite,
}: Props): ReactElement {
  const [isReady, setIsReady] = useState(false)
  const [activeIndex, setActiveIndex] = useState<'confiance' | 'fragilite'>('fragilite')
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

  const currentData = activeIndex === 'fragilite' ? departementsFragilite : departementsConfiance ?? departementsFragilite

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
                <div 
                  style={{ 
                    border: '1px solid #666666',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    overflow: 'hidden',
                    width: '100%',
                  }}
                >
                  <div
                    onClick={(): void => { setActiveIndex('confiance') }}
                    onMouseEnter={(e): void => {
                      e.currentTarget.style.backgroundColor = activeIndex === 'confiance' ? '#e3f2fd' : '#f5f5f5'
                    }}
                    onMouseLeave={(e): void => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      borderRight: '1px solid #666666',
                      color: activeIndex === 'confiance' ? '#000091' : '#666666',
                      cursor: 'pointer',
                      flex: 1,
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Indice de confiance
                  </div>
                  <div
                    onClick={(): void => { setActiveIndex('fragilite') }}
                    onMouseEnter={(e): void => {
                      e.currentTarget.style.backgroundColor = activeIndex === 'fragilite' ? '#e3f2fd' : '#f5f5f5'
                    }}
                    onMouseLeave={(e): void => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: activeIndex === 'fragilite' ? '#000091' : '#666666',
                      cursor: 'pointer',
                      flex: 1,
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Indice de fragilité numérique
                  </div>
                </div>
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
                {currentData.message}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const departementsData = transformerDonneesCarteFrance(
    departementsFragilite as ReadonlyArray<DepartementFragilite>,
    departementsConfiance as ReadonlyArray<DepartementConfiance>,
    activeIndex
  )

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
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', width: '80%' }}>
              <div 
                style={{ 
                  border: '1px solid #666666',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                <div
                  onClick={(): void => { setActiveIndex('confiance') }}
                  onMouseEnter={(e): void => {
                    e.currentTarget.style.backgroundColor = activeIndex === 'confiance' ? '#e3f2fd' : '#f5f5f5'
                  }}
                  onMouseLeave={(e): void => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    borderRight: '1px solid #666666',
                    color: activeIndex === 'confiance' ? '#000091' : '#666666',
                    cursor: 'pointer',
                    flex: 1,
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Indice de confiance
                </div>
                <div
                  onClick={(): void => { setActiveIndex('fragilite') }}
                  onMouseEnter={(e): void => {
                    e.currentTarget.style.backgroundColor = activeIndex === 'fragilite' ? '#e3f2fd' : '#f5f5f5'
                  }}
                  onMouseLeave={(e): void => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: activeIndex === 'fragilite' ? '#000091' : '#666666',
                    cursor: 'pointer',
                    flex: 1,
                    padding: '0.75rem 1rem',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Indice de fragilité numérique
                </div>
              </div>
            </div>
            {activeIndex === 'confiance' && (
              <div className="font-weight-700 color-red">
                L&apos;Indice de confiance est en cours de construction. Les données présentées
                ne correspondent pas à la réalité et sont uniquement à des fins de démonstration.
              </div>
            )}
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

function isErrorViewModel(
  viewModel: ErrorViewModel |
  ReadonlyArray<DepartementConfiance> |
  ReadonlyArray<DepartementFragilite>
): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  departementsConfiance?: ErrorViewModel |
    ReadonlyArray<DepartementConfiance>
  departementsFragilite: ErrorViewModel |
    ReadonlyArray<DepartementFragilite>
}>