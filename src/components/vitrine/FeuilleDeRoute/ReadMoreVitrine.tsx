'use client'

import { ReactElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

// Texte replié : seul l'extrait visible (les 3 premières lignes) est dans la page, pour que le lecteur d'écran ne lise
// que ce qui est affiché. « Lire plus » ajoute le texte entier et y déplace le focus (RGAA 7.1, motif accede-web
// « boutons Afficher plus ») ; le bouton annonce son état par aria-expanded.
export default function ReadMoreVitrine({ texte }: Props): ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [extrait, setExtrait] = useState<string | undefined>(undefined)
  const contenu = useRef<HTMLDivElement>(null)
  const doitRecevoirLeFocus = useRef(false)
  const idContenu = useId()

  useLayoutEffect(() => {
    const element = contenu.current
    if (element === null || !isCollapsed) {
      return undefined
    }
    let largeurMesuree = element.clientWidth
    if (largeurMesuree > 0) {
      setExtrait(mesurerExtrait(element, texte))
    }
    // Remesure quand la largeur change : ouverture de la fenêtre modale, redimensionnement
    const observateur = new ResizeObserver(() => {
      if (element.clientWidth > 0 && element.clientWidth !== largeurMesuree) {
        largeurMesuree = element.clientWidth
        setExtrait(mesurerExtrait(element, texte))
      }
    })
    observateur.observe(element)
    return () => {
      observateur.disconnect()
    }
  }, [texte, isCollapsed])

  useEffect(() => {
    const element = contenu.current
    if (element === null || isCollapsed) {
      return undefined
    }
    if (doitRecevoirLeFocus.current) {
      doitRecevoirLeFocus.current = false
      element.focus()
    }
    // Le piège à focus du DSFR renvoie sur le premier élément de la fenêtre modale quand le focus est sur un élément
    // qu'il ne connaît pas (tabindex="-1") : depuis le texte déplié, Tab doit mener à « Lire moins »
    function laisserLaTabulationNative(event: KeyboardEvent): void {
      if (event.key === 'Tab') {
        event.stopPropagation()
      }
    }
    element.addEventListener('keydown', laisserLaTabulationNative)
    return () => {
      element.removeEventListener('keydown', laisserLaTabulationNative)
    }
  }, [isCollapsed])

  const estTronque = extrait !== undefined

  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html: isCollapsed && estTronque ? extrait : texte,
        }}
        id={idContenu}
        ref={contenu}
        tabIndex={isCollapsed ? undefined : -1}
      />
      {estTronque ? (
        <div className="fr-grid-row fr-grid-row--right fr-mt-1w">
          <button
            aria-controls={idContenu}
            aria-expanded={!isCollapsed}
            className={`color-blue-france fr-btn--icon-right fr-icon-arrow-${isCollapsed ? 'down' : 'up'}-s-line`}
            onClick={() => {
              doitRecevoirLeFocus.current = isCollapsed
              setIsCollapsed(!isCollapsed)
            }}
            type="button"
          >
            {isCollapsed ? 'Lire plus' : 'Lire moins'}
          </button>
        </div>
      ) : null}
    </>
  )
}

const NOMBRE_DE_LIGNES_VISIBLES = 3

// Plus long extrait qui tient dans les lignes visibles, coupé à la fin d'un mot ; undefined si le texte entier y tient
function mesurerExtrait(element: HTMLDivElement, texte: string): string | undefined {
  const hauteurDeLigne = parseFloat(getComputedStyle(element).lineHeight)
  if (Number.isNaN(hauteurDeLigne) || hauteurDeLigne <= 0) {
    return undefined
  }
  const contenuAffiche = element.innerHTML
  // Nombre de lignes arrondi : Firefox compte un pixel de plus que la hauteur des lignes
  function tient(html: string): boolean {
    element.innerHTML = html
    return Math.round(element.scrollHeight / hauteurDeLigne) <= NOMBRE_DE_LIGNES_VISIBLES
  }
  let extrait: string | undefined
  if (!tient(texte)) {
    let minimum = 0
    let maximum = compterLesMots(texte) - 1
    while (minimum < maximum) {
      const milieu = Math.ceil((minimum + maximum) / 2)
      if (tient(tronquerHtml(texte, milieu))) {
        minimum = milieu
      } else {
        maximum = milieu - 1
      }
    }
    extrait = tronquerHtml(texte, minimum)
  }
  element.innerHTML = contenuAffiche
  return extrait
}

function compterLesMots(html: string): number {
  return textesDe(modeleDe(html)).reduce((total, noeud) => total + (noeud.data.match(MOT) ?? []).length, 0)
}

// Garde les premiers mots en conservant la mise en forme (paragraphes, listes, gras), puis ajoute « … »
function tronquerHtml(html: string, nombreDeMots: number): string {
  const modele = modeleDe(html)
  let motsRestants = nombreDeMots
  for (const noeud of textesDe(modele)) {
    const mots = Array.from(noeud.data.matchAll(MOT))
    if (mots.length >= motsRestants) {
      const coupure = mots.slice(0, motsRestants).reduce((_, mot) => mot.index + mot[0].length, 0)
      const suite = document.createRange()
      suite.setStart(noeud, coupure)
      suite.setEnd(modele.content, modele.content.childNodes.length)
      suite.deleteContents()
      noeud.appendData('…')
      break
    }
    motsRestants -= mots.length
  }
  return modele.innerHTML
}

function modeleDe(html: string): HTMLTemplateElement {
  const modele = document.createElement('template')
  modele.innerHTML = html
  return modele
}

function textesDe(modele: HTMLTemplateElement): ReadonlyArray<Text> {
  const parcours = document.createTreeWalker(modele.content, NodeFilter.SHOW_TEXT)
  const textes: Array<Text> = []
  for (let noeud = parcours.nextNode(); noeud !== null; noeud = parcours.nextNode()) {
    textes.push(noeud as Text)
  }
  return textes
}

const MOT = /\S+/g

type Props = Readonly<{
  texte: string
}>
