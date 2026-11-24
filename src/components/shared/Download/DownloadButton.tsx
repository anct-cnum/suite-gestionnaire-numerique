'use client'

import { MouseEvent, ReactElement, RefObject, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { capturerEnPng } from '@/shared/DownloadHelp'

// RGAA 7.1 (#2354) : un téléchargement est un lien <a download>, pas un bouton.
// L'image du graphique est générée au clic, puis le lien la télécharge sans changer de page.
export function DownloadButton({ cible, nomFichier, title }: DownloadButtonProps): ReactElement {
  const lien = useRef<HTMLAnchorElement>(null)
  const imagePrete = useRef(false)
  const [href, setHref] = useState(HREF_AVANT_GENERATION)

  useEffect(() => {
    return () => {
      if (href !== HREF_AVANT_GENERATION) {
        URL.revokeObjectURL(href)
      }
    }
  }, [href])

  async function genererPuisTelecharger(event: MouseEvent<HTMLAnchorElement>): Promise<void> {
    if (imagePrete.current) {
      // Le lien pointe sur l'image tout juste générée : le navigateur la télécharge
      imagePrete.current = false
      return
    }
    event.preventDefault()
    if (cible.current === null) {
      return
    }
    const image = await capturerEnPng(cible.current)
    if (image === null) {
      return
    }
    flushSync(() => {
      setHref(URL.createObjectURL(image))
    })
    imagePrete.current = true
    lien.current?.click()
  }

  return (
    <div>
      <a
        className="fr-btn fr-btn--tertiary fr-btn--icon-only fr-icon-download-line fr-icon--xs"
        download={nomFichier}
        href={href}
        onClick={(event) => {
          void genererPuisTelecharger(event)
        }}
        ref={lien}
        style={{
          alignItems: 'center',
          color: 'var(--text-mention-grey)',
          display: 'flex',
          height: '32px',
          justifyContent: 'center',
          minHeight: '32px',
          width: '32px',
        }}
      >
        <span className="fr-sr-only">{`Télécharger le graphique ${title} (PNG)`}</span>
      </a>
    </div>
  )
}

const HREF_AVANT_GENERATION = '#'

type DownloadButtonProps = Readonly<{
  cible: RefObject<HTMLElement | null>
  nomFichier: string
  title: string
}>
