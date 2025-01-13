'use client'

import { Dispatch, ReactElement, RefObject, SetStateAction } from 'react'

import EditeurCreationNoteDeContext from './EditeurCreationNoteDeContext'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'

export default function AjouterNoteDeContext({
  labelId,
}: Props): ReactElement {
  return (
    <div>
      <DrawerTitle id={labelId}>
        Note de contexte
      </DrawerTitle>
      <div className="fr-mb-4w">
        <div className="color-grey fr-text--sm">
          Précisez, au sein d‘une note qualitative,
          les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez,
          ou tout autre élément que vous souhaitez porter à notre connaissance
        </div>
      </div>
      <form aria-label="Formulaire d'ajout de note de contexte">
        <EditeurCreationNoteDeContext initialContent="" />
        <div className="fr-my-3w">
          <ul className="fr-btns-group">
            <li>
              <button
                className="fr-btn"
                disabled
                type="submit"
              >
                Enregistrer
              </button>
            </li>
          </ul>
        </div>
      </form>
    </div>
  )
}

type Props = Readonly<{
  dialogRef: RefObject<HTMLDialogElement | null>
  drawerId: string
  labelId: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
}>
