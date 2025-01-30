'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import styles from '../Gouvernance.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { Notification } from '@/components/shared/Notification/Notification'
import { useRichTextEditor } from '@/components/shared/RichTextEditor/hooks/useRichTextEditor'
import EditeurDeTexte from '@/components/shared/RichTextEditor/TextEditor'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'

export default function ModifierNoteDeContexte({
  texte,
  sousTitre,
  id,
  label,
  labelId,
  uidGouvernance,
  closeDrawer,
}: Props): ReactElement {
  const { modifierUneNoteDeContexteAction, supprimerUneNoteDeContexteAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { contenu, gererLeChangementDeContenu, viderLeContenu } = useRichTextEditor()
  const hasContent = Boolean(texte && contenu.trim())

  return (
    <>
      <form
        aria-labelledby={labelId}
        method="dialog"
        onSubmit={modifierUneNoteDeContexte}
      >
        <DrawerTitle id={labelId}>
          {label}
        </DrawerTitle>
        <div className="fr-mb-4w">
          <div className="color-grey fr-text--sm">
            Précisez, au sein d‘une note qualitative,
            les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez,
            ou tout autre élément que vous souhaitez porter à notre connaissance
          </div>
        </div>
        <EditeurDeTexte
          contenu={texte}
          onChange={gererLeChangementDeContenu}
        />
        <ul className="fr-btns-group fr-mt-2w">
          <li>
            <SubmitButton
              ariaControls={id}
              isDisabled={!hasContent || isDisabled}
            >
              {isDisabled ? 'Modification en cours...' : 'Enregistrer'}
            </SubmitButton>
          </li>
          <li>
            <button
              aria-controls={id}
              className="fr-btn red-button"
              onClick={supprimerNoteDeContexte}
              type="button"
            >
              Supprimer
            </button>
          </li>
        </ul>
      </form>
      <p className={`fr-text--xs ${styles.center}`}>
        {sousTitre}
      </p>
    </>
  )

  async function modifierUneNoteDeContexte(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const messages = await modifierUneNoteDeContexteAction({ contenu, path: pathname, uidGouvernance })
    if (messages[0] === 'OK') {
      Notification('success', { description: 'modifiée', title: 'Note de contexte ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer();
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }

  async function supprimerNoteDeContexte(event: React.MouseEvent): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const messages = await supprimerUneNoteDeContexteAction({ path: pathname, uidGouvernance })
    if (messages[0] === 'OK') {
      viderLeContenu()
      Notification('success', { description: 'bien supprimée', title: 'Note de contexte ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  texte: string
  sousTitre: string
  id: string
  labelId: string
  label: string
  uidGouvernance: string
  closeDrawer(): void
}>
