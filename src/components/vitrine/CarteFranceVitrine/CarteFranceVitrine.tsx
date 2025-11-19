'use client'
import { useRouter } from 'next/navigation'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import CarteFranceAvecInsets from '@/components/shared/Carte/CarteFranceAvecInsets'
import { transformerDonneesCarteFranceVitrine } from '@/presenters/tableauDeBord/indicesPresenter'

export default function CarteFranceVitrine(): ReactElement {
  const router = useRouter()
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

  const handleDepartementClick = useCallback((codeDepartement: string) => {
    router.push(`/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/${codeDepartement}`)
  }, [router])

  const departementsViewModel = transformerDonneesCarteFranceVitrine()

  const legend = (
    <div
      style={{
        color: 'var(--light-text-title-grey, #161616)',
        fontFamily: 'Marianne',
        fontSize: '1.125rem',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '1.75rem',
        textAlign: 'center',
      }}
    >
      Sélectionnez un territoire sur la carte
    </div>
  )

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        height: '100%',
        width: '100%',
      }}
    >
      {/* On attend que le composant soit prêt avant de charger la carte */}
      {isReady ?
        <CarteFranceAvecInsets
          donneesDepartements={departementsViewModel}
          legend={legend}
          onDepartementClick={handleDepartementClick}
        /> : null}
    </div>
  )
}
