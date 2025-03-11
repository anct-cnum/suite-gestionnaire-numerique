'use client'

import { ReactElement } from 'react'

import AjouterUneNotePrivee from './AjouterUneNotePrivee'
import ModifierUneNotePrivee from './ModifierUneNotePrivee'
import ResumeNotePrivee from './ResumeNotePrivee'
import ResumeNotePriveeVide from './ResumeNotePriveeVide'
import Drawer from '../../shared/Drawer/Drawer'
import styles from '../Gouvernance.module.css'
import Resume from '../Resume'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function SectionNotePrivee({
  gouvernanceViewModel,
  drawerNotePriveeId,
  labelNotePriveeId,
  isDrawerOpen,
  setIsDrawerOpen,
}: Readonly<Props>): ReactElement | null {
  if (!gouvernanceViewModel.peutVoirNotePrivee) {
    return null
  }
  if (gouvernanceViewModel.notePrivee) {
    return (
      <>
        <Drawer
          boutonFermeture="Fermer le formulaire de modification d‘une note privée"
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          id={drawerNotePriveeId}
          isFixedWidth={false}
          isOpen={isDrawerOpen}
          labelId={labelNotePriveeId}
        >
          <ModifierUneNotePrivee
            closeDrawer={() => {
              setIsDrawerOpen(false)
            }}
            edition={gouvernanceViewModel.notePrivee.edition}
            id={drawerNotePriveeId}
            labelId={labelNotePriveeId}
            texte={gouvernanceViewModel.notePrivee.texte}
            uidGouvernance={gouvernanceViewModel.uid}
          />
        </Drawer>
        <Resume
          peutVoirNotePrivee={gouvernanceViewModel.peutVoirNotePrivee}
          style={styles['resume-note-privee']}
        >
          <ResumeNotePrivee
            edition={gouvernanceViewModel.notePrivee.edition}
            id={drawerNotePriveeId}
            showDrawer={() => {
              setIsDrawerOpen(true)
            }}
            texte={gouvernanceViewModel.notePrivee.resume}
          />
        </Resume>
      </>
    )
  }

  return (
    <>
      <Drawer
        boutonFermeture="Fermer le formulaire de création d’une note privée"
        closeDrawer={() => {
          setIsDrawerOpen(false)
        }}
        id={drawerNotePriveeId}
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelNotePriveeId}
      >
        <AjouterUneNotePrivee
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          id={drawerNotePriveeId}
          labelId={labelNotePriveeId}
          uidGouvernance={gouvernanceViewModel.uid}
        />
      </Drawer>
      <Resume
        peutVoirNotePrivee={gouvernanceViewModel.peutVoirNotePrivee}
        style={styles['resume-note-privee-vide']}
      >
        <ResumeNotePriveeVide
          id={drawerNotePriveeId}
          showDrawer={() => {
            setIsDrawerOpen(true)
          }}
        />
      </Resume>
    </>
  )
}

type Props = {
  gouvernanceViewModel: GouvernanceViewModel
  drawerNotePriveeId: string
  labelNotePriveeId: string
  isDrawerOpen: boolean
  setIsDrawerOpen(isOpen: boolean): void
}
