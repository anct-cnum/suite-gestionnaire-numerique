'use client'

import { ReactElement, useEffect, useRef, useState } from 'react'

import styles from './ReadMoreVitrine.module.css'

export default function ReadMoreVitrine({ texte }: Props): ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [showButton, setShowButton] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      const element = contentRef.current
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
      const maxHeight = lineHeight * 3
      setShowButton(element.scrollHeight > maxHeight)
    }
  }, [texte])

  return (
    <>
      <div
        className={isCollapsed ? styles.collapse : ''}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: texte,
        }}
        ref={contentRef}
      />
      {showButton ? (
        <div className="fr-grid-row fr-grid-row--right">
          <button
            className={`color-blue-france fr-btn--icon-right fr-icon-arrow-${isCollapsed ? 'down' : 'up'}-s-line`}
            onClick={() => {
              setIsCollapsed(!isCollapsed)
            }}
            type="button"
          >
            {isCollapsed ? 'Lire plus' : 'Lire moins' }
          </button>
        </div>
      ) : null}
    </>
  )
}

type Props = Readonly<{
  texte: string
}>
