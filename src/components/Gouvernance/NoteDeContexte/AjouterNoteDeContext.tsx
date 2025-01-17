'use client'

import { FormEvent, ReactElement, RefObject, useState } from 'react'

import { ajouterUneNoteDeContexteAction } from '@/app/api/actions/ajouterUneNoteDeContexteAction'
import EditeurDeTexte from '@/components/EditeurDeTexteEnrichi/EditeurDeTexte'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { Notification } from '@/components/shared/Notification/Notification'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'

export default function AjouterNoteDeContext({
  dialogRef,
  labelId,
  closeDrawer,
}: Props): ReactElement {
  const [content, setContent] = useState('')
  const [isDisabled, setIsDisabled] = useState(false)

  function handleContentChange(newContent: string): void {
    setContent(newContent)
  }
  return (
    <form
      aria-label="Ajouter une note de contexte"
      method="dialog"
      onSubmit={creerUneNoteDeContext}
    >
      <DrawerTitle id={labelId}>
        Ajouter une note de contexte
      </DrawerTitle>
      <div className="fr-mb-4w">
        <div className="color-grey fr-text--sm">
          Précisez, au sein d‘une note qualitative,
          les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez,
          ou tout autre élément que vous souhaitez porter à notre connaissance
        </div>
      </div>
      <EditeurDeTexte
        initialContent=""
        onChange={handleContentChange}
      />
      <div className="fr-my-3w">
        <ul className="fr-btns-group">
          <li>
            <SubmitButton
              isDisabled={!content.trim() || isDisabled}
              label={isDisabled ? 'Ajout en cours...' : 'Enregistrer'}
            />
          </li>
        </ul>
      </div>
    </form>
  )

  async function creerUneNoteDeContext(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const result = await ajouterUneNoteDeContexteAction()
    if (result === 'OK') {
      Notification('success', { description: 'bien ajouté', title: 'Note de contexte ' })
    }
    closeDrawer();
    (event.target as HTMLFormElement).reset()
    window.dsfr(dialogRef.current).modal.conceal()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  dialogRef: RefObject<HTMLDialogElement | null>
  labelId: string
  closeDrawer(): void
}>
