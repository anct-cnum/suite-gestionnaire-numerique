import html2canvas from 'html2canvas'
import { RefObject } from 'react'

export async function handleDownload(component: RefObject<HTMLDivElement | null>, fileName: string ): Promise<void> {
  if (component.current) {
    try {
      const canvas = await html2canvas(component.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Pour une meilleure qualité
      })

      // Convertir en blob et télécharger
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = fileName
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
      })
    } catch {
      // Erreur silencieuse pour l'utilisateur
    }
  }
}
