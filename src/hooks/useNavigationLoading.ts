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
          setIsLoading(true)
          
          // Timeout de sécurité au cas où la navigation prendrait trop de temps
          timeoutRef.current = setTimeout(() => {
            setIsLoading(false)
          }, 3000)
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

  // Désactiver le spinner quand la page change vraiment
  useEffect(() => {
    if (isLoading) {
      setIsLoading(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname, searchParams])

  return isLoading
}