'use client'

import { ReactElement, useRef, useState } from 'react'

import styles from '../Gouvernance.module.css'
import ModifierNoteDeContexte from './ModifierNoteDeContexte'
import Drawer from '@/components/shared/Drawer/Drawer'

export default function NoteDeContexteRemplie({
  texte, uidGouvernance, drawerModifierNoteDeContexteId, labelId, isDrawerOpen, setIsDrawerOpen,
}: Props): ReactElement {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const drawerRef = useRef<HTMLDialogElement>(null)

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
      <Drawer
        boutonFermeture="Fermer la modification"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerModifierNoteDeContexteId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
        ref={drawerRef}
      >
        <ModifierNoteDeContexte
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          id={drawerModifierNoteDeContexteId}
          label="Modifier note de contexte"
          labelId={labelId}
          texte={texte}
          uidGouvernance={uidGouvernance}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  texte: string
  uidGouvernance: string
  drawerModifierNoteDeContexteId: string
  labelId: string
  isDrawerOpen: boolean
  setIsDrawerOpen(isDrawerOpen: boolean): void
}>
