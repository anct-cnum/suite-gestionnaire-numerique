'use client'

import { ReactElement, useState } from 'react'

import styles from '../Gouvernance.module.css'
import ModifierNoteDeContexte from './ModifierNoteDeContexte'
import Drawer from '@/components/shared/Drawer/Drawer'

export default function NoteDeContexteRemplie({
  texte, uidGouvernance, drawerModifierNoteDeContexteId, labelId, isDrawerOpen, sousTitre, setIsDrawerOpen,
}: Props): ReactElement {
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
      <Drawer
        boutonFermeture="Fermer le formulaire de modification d’une note de contexte"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerModifierNoteDeContexteId}
        // Stryker disable next-line BooleanLiteral
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <ModifierNoteDeContexte
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          id={drawerModifierNoteDeContexteId}
          label="Note de contexte"
          labelId={labelId}
          sousTitre={sousTitre}
          texte={texte}
          uidGouvernance={uidGouvernance}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  texte: string
  sousTitre: string
  uidGouvernance: string
  drawerModifierNoteDeContexteId: string
  labelId: string
  isDrawerOpen: boolean
  setIsDrawerOpen(isDrawerOpen: boolean): void
}>
