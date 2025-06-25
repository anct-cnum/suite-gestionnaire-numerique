import { ReactElement, useEffect, useRef, useState } from 'react'

import Carte from '../../shared/Carte/Carte'
import { CommuneFragilite } from '@/presenters/indiceFragilitePresenter'

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

type Props = Readonly<{
  communesFragilite: Array<CommuneFragilite>
  departement: string
}> 