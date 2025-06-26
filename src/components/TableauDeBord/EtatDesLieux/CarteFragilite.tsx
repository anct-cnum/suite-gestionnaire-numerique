import { ReactElement, useEffect, useRef, useState } from 'react'

import Carte from '../../shared/Carte/Carte'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { CommuneFragilite } from '@/presenters/tableauDeBord/indiceFragilitePresenter'

export default function CarteFragilite({ 
  communesFragilite,
  departement,
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

  if (isErrorViewModel(communesFragilite)) {
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
                Indice de Fragilité numérique
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
                {communesFragilite.message}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
        <div style={{ padding: '1rem' }}>
          <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <div className="font-weight-700 color-blue-france">
              Indice de Fragilité numérique
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {/* On attend que le composant chart soit prêt avant de charger la carte */}
          {isReady ? 
            <Carte
              communesFragilite={communesFragilite}
              departement={departement}
            /> : null}
        </div>
      </div>
    </div>
  )
}

function isErrorViewModel(viewModel: Array<CommuneFragilite> | ErrorViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  communesFragilite: Array<CommuneFragilite> | ErrorViewModel
  departement: string
}> 