import { ReactNode } from 'react'

/**
 * Parse un texte contenant des balises de mise en forme **texte** pour créer des éléments React
 * avec du texte en gras.
 * 
 * @param text Le texte à parser contenant des balises **texte en gras**
 * @returns ReactNode avec les parties en gras rendues dans des éléments <strong>
 * 
 * @example
 * parseTextWithBold("Voici du **texte en gras** normal")
 * // Retourne: ["Voici du ", <strong>texte en gras</strong>, " normal"]
 */
export function parseTextWithBold(text: string): ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, index) => (
    index % 2 === 1 ? (
      <strong key={`bold-${part}`}>
        {part}
      </strong>
    ) : (
      part
    )
  ))
}