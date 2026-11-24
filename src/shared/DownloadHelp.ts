import html2canvas from 'html2canvas'

// Capture un élément de la page en image PNG ; null si la capture échoue (erreur silencieuse pour l'utilisateur)
export async function capturerEnPng(element: HTMLElement): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Pour une meilleure qualité
    })

    return await new Promise((resolve) => {
      canvas.toBlob(resolve)
    })
  } catch {
    return null
  }
}
