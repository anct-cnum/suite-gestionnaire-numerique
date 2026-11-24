'use client'

import { createContext, ReactElement, ReactNode, useContext } from 'react'

// Lien ancre placé juste après le <canvas> d'un graphique, vers son tableau de données dans les « Chiffres clés en
// tableau » (RGAA 1.1, Arya Access 16/11/2026) : il ouvre l'accordéon et l'onglet du graphique par l'API du DSFR,
// puis place le focus sur le tableau. Sans JS du DSFR, l'ancre reste un lien vers le panneau.
export function LienVersChiffresCles({ children, cible }: Props): ReactElement {
  return (
    <a
      className="fr-link fr-link--sm"
      href={`#${idDeLaCible(cible)}`}
      onClick={(event) => {
        if (afficherLaCible(cible)) {
          event.preventDefault()
        }
      }}
    >
      {children}
    </a>
  )
}

// Cible du lien qui suit le canvas d'une carte : fournie par le bloc qui affiche la carte et ses chiffres clés,
// absente quand la carte n'a pas de tableau associé (page d'accueil des données territoriales).
export const CibleDonneesDeLaCarte = createContext<CibleChiffresCles | null>(null)

export function LienVersDonneesDeLaCarte(): null | ReactElement {
  const cible = useContext(CibleDonneesDeLaCarte)
  if (cible === null) {
    return null
  }
  return (
    <p className="fr-px-2w fr-mb-0">
      <LienVersChiffresCles cible={cible}>Voir les données de la carte en tableau</LienVersChiffresCles>
    </p>
  )
}

export function idContenuChiffresCles(idChiffresCles: string): string {
  return `${idChiffresCles}-contenu`
}

export function idPanneauChiffresCles(idChiffresCles: string, indexOnglet: number): string {
  return `${idChiffresCles}-panneau-${indexOnglet}`
}

// indexOnglet vaut null quand les chiffres clés n'ont qu'un tableau, donc pas d'onglets
export type CibleChiffresCles = Readonly<{
  idChiffresCles: string
  indexOnglet: null | number
}>

type Props = Readonly<{
  children: ReactNode
  cible: CibleChiffresCles
}>

function idDeLaCible({ idChiffresCles, indexOnglet }: CibleChiffresCles): string {
  return indexOnglet === null
    ? idContenuChiffresCles(idChiffresCles)
    : idPanneauChiffresCles(idChiffresCles, indexOnglet)
}

function afficherLaCible(cible: CibleChiffresCles): boolean {
  const contenu = document.getElementById(idContenuChiffresCles(cible.idChiffresCles))
  if (contenu === null || typeof window.dsfr !== 'function') {
    return false
  }
  const panneau =
    cible.indexOnglet === null
      ? null
      : document.getElementById(idPanneauChiffresCles(cible.idChiffresCles, cible.indexOnglet))
  // Le DSFR rend le focus, à la fermeture de l'accordéon, à l'élément focalisé à son ouverture : on le pose d'abord sur
  // le bouton de l'accordéon, sinon refermer l'accordéon renverrait le focus (et la page) jusqu'au lien.
  document
    .querySelector<HTMLElement>(`[aria-controls="${idContenuChiffresCles(cible.idChiffresCles)}"]`)
    ?.focus({ preventScroll: true })
  window.dsfr(contenu).collapse.disclose()
  if (panneau !== null) {
    window.dsfr(panneau).tabPanel.disclose()
  }
  const conteneur = panneau ?? contenu
  focaliserDesQueVisible(conteneur.querySelector<HTMLElement>('table') ?? conteneur, NOMBRE_MAX_D_IMAGES)
  return true
}

// Le DSFR ouvre l'accordéon et l'onglet à l'image suivante, avec une transition : le tableau n'est focalisable
// qu'une fois visible.
function focaliserDesQueVisible(element: HTMLElement, imagesRestantes: number): void {
  if (getComputedStyle(element).visibility !== 'hidden' || imagesRestantes === 0) {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '-1')
    }
    element.focus()
    return
  }
  requestAnimationFrame(() => {
    focaliserDesQueVisible(element, imagesRestantes - 1)
  })
}

const NOMBRE_MAX_D_IMAGES = 60
