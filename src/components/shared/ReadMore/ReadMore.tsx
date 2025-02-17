'use client'

import { ReactElement, useState } from 'react'

import styles from './ReadMore.module.css'

export default function ReadMore({ texte }: Props): ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <>
      <div
        className={isCollapsed ? styles.collapse : ''}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: texte,
        }}
      />
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
    </>
  )
}

type Props = Readonly<{
  texte: string
}>
