'use client'

import { ReactElement, useState } from 'react'

import styles from '../Gouvernance.module.css'
import SectionRemplie from '../SectionRemplie'
import SubSectionButton from './SubSectionButton'

export default function NoteDeContexteRemplie({
  sousTitre,
  texte,
}: NoteDeContexteRemplieProps): ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <SectionRemplie
      button={(
        <button
          className="fr-btn fr-btn--secondary"
          type="button"
        >
          Modifier
        </button>
      )}
      id="noteDeContexte"
      subButton={(
        <SubSectionButton>
          {sousTitre}
        </SubSectionButton>
      )}
      title="Note de contexte"
    >
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
    </SectionRemplie>
  )
}

type NoteDeContexteRemplieProps = Readonly<{
  sousTitre: string
  texte: string
}>
