'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

/**
 * Hook pour afficher un spinner lors de la navigation
 * Se déclenche immédiatement au clic sur un lien
 */
export function useNavigationLoading(): boolean {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const targetUrlRef = useRef<null | string>(null)

  useEffect(() => {
    // Intercepter les clics sur tous les liens de pagination
    function handleClick(event: MouseEvent): void {
      const target = event.target as HTMLElement
      const link = target.closest('a')
      
      if (link !== null && link.href !== '' && (
        link.classList.contains('fr-pagination__link') ||
        link.closest('.fr-pagination')
      )) {
        // Vérifier que c'est bien un changement de page
        const currentUrl = window.location.href
        const newUrl = link.href
        
        if (currentUrl !== newUrl && !link.href.includes('#')) {
          // Stocker l'URL cible
          const url = new URL(newUrl)
          targetUrlRef.current = `${url.pathname}?${url.searchParams.toString()}`
          
          setIsLoading(true)
          
          // Timeout de sécurité au cas où la navigation prendrait trop de temps
          timeoutRef.current = setTimeout(() => {
            setIsLoading(false)
            targetUrlRef.current = null
          }, 30000) // 30 secondes pour les chargements lents
        }
      }
    }

    // Ajouter l'écouteur sur tout le document avec capture
    document.addEventListener('click', handleClick, true)

    return (): void => {
      document.removeEventListener('click', handleClick, true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Observer les changements d'URL pour détecter quand on arrive sur la page cible
  useEffect(() => {
    const currentUrl = `${pathname}?${searchParams.toString()}`
    
    // Si on charge et qu'on arrive sur l'URL cible
    if (isLoading && targetUrlRef.current !== null && currentUrl === targetUrlRef.current) {
      // Attendre un peu pour que le contenu se charge
      const renderTimeout = setTimeout(() => {
        setIsLoading(false)
        targetUrlRef.current = null
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }, 500) // 500ms pour laisser le temps au contenu de se rendre
      
      return (): void => { clearTimeout(renderTimeout) }
    }
    return undefined
  }, [pathname, searchParams, isLoading])

  return isLoading
}