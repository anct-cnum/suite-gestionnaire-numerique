'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import EditeurDeTexte from '@/components/shared/EditeurDeTexteEnrichi/EditeurDeTexte'
import { useRichTextEditor } from '@/components/shared/EditeurDeTexteEnrichi/hooks/useRichTextEditor'
import { Notification } from '@/components/shared/Notification/Notification'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'

export default function AjouterNoteDeContext({
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
      onSubmit={creerUneNoteDeContext}
    >
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
      <EditeurDeTexte
        contenu=""
        onChange={gererLeChangementDeContenu}
      />
      <ul className="fr-btns-group fr-mt-2w">
        <li>
          <SubmitButton
            ariaControls={id}
            isDisabled={!contenu.trim() || isDisabled}
            label={isDisabled ? 'Ajout en cours...' : 'Enregistrer'}
          />
        </li>
        {contenu ?
          <li>
            <button
              className="fr-btn red-button"
              onClick={viderLeContenu}
              type="button"
            >
              Supprimer
            </button>
          </li>
          :
          null}
      </ul>
    </form>
  )

  async function creerUneNoteDeContext(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const messages = await ajouterUneNoteDeContexteAction({  contenu, path: pathname , uidGouvernance})
    if (messages[0] === 'OK') {
      Notification('success', { description: 'bien ajoutée', title: 'Note de contexte ' })
      viderLeContenu()
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer();
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  id: string
  labelId: string
  uidGouvernance: string
  closeDrawer(): void
}>
