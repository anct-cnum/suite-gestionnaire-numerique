'use client'
import { ReactElement, useEffect, useRef, useState } from 'react'

import CarteFranceAvecInsets from '../../shared/Carte/CarteFranceAvecInsets'
import Legend from '../../shared/Carte/Legend'
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

  const isFragiliteError = activeIndex === 'fragilite' && isErrorViewModel(departementsFragilite)
  const isConfianceErrorActive = activeIndex === 'confiance' && (!departementsConfiance || isConfianceError(departementsConfiance))
  const hasError = isFragiliteError || isConfianceErrorActive

  if (hasError) {
    let errorMessage = 'Erreur de chargement'
    if (isFragiliteError) {
      errorMessage = departementsFragilite.message
    } else if (activeIndex === 'confiance' && isConfianceError(departementsConfiance)) {
      errorMessage = departementsConfiance.message
    }
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
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <fieldset 
                  className="fr-segmented"
                  style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
                >
                  <div 
                    className="fr-segmented__elements"
                    style={{ display: 'flex', justifyContent: 'center', width: '80%' }}
                  >
                    <div
                      className="fr-segmented__element"
                      style={{ width: '50%' }}
                    >
                      <input 
                        checked={activeIndex === 'confiance'} 
                        id="segmented-confiance" 
                        name="indice-selection" 
                        onChange={(): void => { setActiveIndex('confiance') }}
                        type="radio"
                        value="confiance"
                      />
                      <label
                        className="fr-label"
                        htmlFor="segmented-confiance"
                        style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', textAlign: 'center', width: '100%' }}
                      >
                        Indice de confiance
                      </label>
                    </div>
                    <div
                      className="fr-segmented__element"
                      style={{ width: '50%' }}
                    >
                      <input 
                        checked={activeIndex === 'fragilite'} 
                        id="segmented-fragilite" 
                        name="indice-selection" 
                        onChange={(): void => { setActiveIndex('fragilite') }}
                        type="radio"
                        value="fragilite"
                      />
                      <label
                        className="fr-label"
                        htmlFor="segmented-fragilite"
                        style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', textAlign: 'center', width: '100%' }}
                      >
                        Indice de fragilité numérique
                      </label>
                    </div>
                  </div>
                </fieldset>
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
                {errorMessage}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Extraire les données de confiance et statistiques
  const departementsConfianceData = departementsConfiance && !isConfianceError(departementsConfiance) 
    ? departementsConfiance.departements 
    : undefined
  const statistiquesConfiance = departementsConfiance && !isConfianceError(departementsConfiance) 
    ? departementsConfiance.statistiques 
    : undefined

  const departementsViewModel = transformerDonneesCarteFrance(
    departementsFragilite as ReadonlyArray<DepartementFragilite>,
    departementsConfianceData,
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
        {/* Contrôle Segementé du DSFR */}
        <div style={{ padding: '1rem', paddingTop: '2rem', position: 'relative', zIndex: 10 }}>
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <fieldset
                className="fr-segmented"
                style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
              >
                <div
                  className="fr-segmented__elements"
                  style={{ display: 'flex', justifyContent: 'center', width: '90%' }}
                >
                  <div
                    className="fr-segmented__element"
                    style={{ width: '50%' }}
                  >
                    <input 
                      checked={activeIndex === 'confiance'} 
                      id="segmented-confiance-main" 
                      name="indice-selection-main" 
                      onChange={(): void => { setActiveIndex('confiance') }}
                      type="radio"
                      value="confiance"
                    />
                    <label
                      className="fr-label"
                      htmlFor="segmented-confiance-main"
                      style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', textAlign: 'center', width: '100%' }}
                    >
                      Indice de confiance
                    </label>
                  </div>
                  <div
                    className="fr-segmented__element"
                    style={{ width: '50%' }}
                  >
                    <input 
                      checked={activeIndex === 'fragilite'} 
                      id="segmented-fragilite-main" 
                      name="indice-selection-main" 
                      onChange={(): void => { setActiveIndex('fragilite') }}
                      type="radio"
                      value="fragilite"
                    />
                    <label
                      className="fr-label"
                      htmlFor="segmented-fragilite-main"
                      style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', textAlign: 'center', width: '100%' }}
                    >
                      Indice de fragilité numérique
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {/* On attend que le composant chart soit prêt avant de charger la carte */}
          {isReady ?
            <CarteFranceAvecInsets
              donneesDepartements={departementsViewModel}
              legend={
                activeIndex === 'confiance' && statistiquesConfiance ? (
                  <Legend
                    statistiques={statistiquesConfiance}
                    type="confiance"
                  />
                ) : (
                  <Legend type="fragilite" />
                )
              }
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

function isConfianceError(
  data: ErrorViewModel | Readonly<{
    departements: ReadonlyArray<DepartementConfiance>
    statistiques: Readonly<{
      appuinecessaire: number
      atteignable: number
      compromis: number
      nonenregistres: number
      securise: number
    }>
  }> | undefined
): data is ErrorViewModel {
  return data !== undefined && 'type' in data
}

type Props = Readonly<{
  departementsConfiance?: ErrorViewModel | Readonly<{
    departements: ReadonlyArray<DepartementConfiance>
    statistiques: Readonly<{
      appuinecessaire: number
      atteignable: number
      compromis: number
      nonenregistres: number
      securise: number
    }>
  }>
  departementsFragilite: ErrorViewModel | ReadonlyArray<DepartementFragilite>
}>
