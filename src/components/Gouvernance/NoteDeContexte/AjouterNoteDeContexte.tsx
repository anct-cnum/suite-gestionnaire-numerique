'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { Notification } from '@/components/shared/Notification/Notification'
import { useRichTextEditor } from '@/components/shared/RichTextEditor/hooks/useRichTextEditor'
import TextEditor from '@/components/shared/RichTextEditor/TextEditor'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'

export default function AjouterNoteDeContexte({
  id,
  labelId,
  uidGouvernance,
  closeDrawer,
}: Props): ReactElement {
  const { ajouterUneNoteDeContexteAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { contenu, gererLeChangementDeContenu, viderLeContenu } = useRichTextEditor()
  return (
    <form
      aria-label="Note de contexte"
      method="dialog"
      onSubmit={creerUneNoteDeContexte}
    >
      <DrawerTitle id={labelId}>
        Note de contexte
      </DrawerTitle>
      <div className="fr-mb-4w">
        <div className="fr-text--sm color-grey">
          Précisez, au sein d‘une note qualitative,
          les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez,
          ou tout autre élément que vous souhaitez porter à notre connaissance
        </div>
      </div>
      <TextEditor
        ariaLabel="Éditeur de note de contexte"
        contenu={contenu}
        height={380}
        onChange={gererLeChangementDeContenu}
      />
      <div className="fr-btns-group fr-mt-2w">
        <SubmitButton
          ariaControls={id}
          isDisabled={!contenu.trim()}
        >
          {isDisabled ? 'Ajout en cours...' : 'Enregistrer'}
        </SubmitButton>
        {
          contenu.trim() ?
            <button
              className="fr-btn red-button"
              onClick={viderLeContenu}
              type="button"
            >
              Supprimer
            </button>
            : null
        }
      </div>
    </form>
  )

  async function creerUneNoteDeContexte(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const messages = await ajouterUneNoteDeContexteAction({ contenu, path: pathname, uidGouvernance })
    if (messages[0] === 'OK') {
      viderLeContenu()
      Notification('success', { description: 'ajoutée', title: 'Note de contexte ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  id: string
  labelId: string
  uidGouvernance: string
  closeDrawer(): void
}>
