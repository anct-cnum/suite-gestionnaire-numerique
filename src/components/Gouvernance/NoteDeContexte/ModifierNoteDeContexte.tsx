'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { Notification } from '@/components/shared/Notification/Notification'
import { useRichTextEditor } from '@/components/shared/RichTextEditor/hooks/useRichTextEditor'
import TextEditor from '@/components/shared/RichTextEditor/TextEditor'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'

export default function ModifierNoteDeContexte({
  closeDrawer,
  id,
  label,
  labelId,
  peutGerer,
  sousTitre,
  texte,
  uidGouvernance,
}: Props): ReactElement {
  const { modifierUneNoteDeContexteAction, pathname, supprimerUneNoteDeContexteAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { contenu, gererLeChangementDeContenu, viderLeContenu } = useRichTextEditor(texte)

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
        {peutGerer ?
          <ul className="fr-btns-group fr-mt-2w">
            <li>
              <SubmitButton
                ariaControls={id}
                isDisabled={isDisabled}
              >
                {isDisabled ? 'Modification en cours...' : 'Enregistrer'}
              </SubmitButton>
            </li>
            <li>
              <button
                className="fr-btn red-button"
                onClick={viderLEditeur}
                type="button"
              >
                Effacer
              </button>
            </li>
          </ul> 
          : null}
      </form>
      <p className="fr-text--xs center">
        {sousTitre}
      </p>
    </>
  )

  async function modifierUneNoteDeContexte(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    if (contenu === '') {
      const messages = await supprimerUneNoteDeContexteAction({
        path: pathname,
        uidGouvernance,
      })
      if (messages.includes('OK')) {
        viderLeContenu()
        Notification('success', { description: 'supprimée', title: 'Note de contexte ' })
      } else {
        Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
      }
    } else {
      const messages = await modifierUneNoteDeContexteAction({
        contenu,
        path: pathname,
        uidGouvernance,
      })
      if (messages.includes('OK')) {
        Notification('success', { description: 'bien modifiée', title: 'Note de contexte ' })
      } else {
        Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
      }
    }
    closeDrawer()
    setIsDisabled(false)
  }

  function viderLEditeur(event: FormEvent<HTMLButtonElement>): void {
    event.preventDefault()
    viderLeContenu()
  }
}

type Props = Readonly<{
  closeDrawer(): void
  id: string
  label: string
  labelId: string
  peutGerer: boolean
  sousTitre: string
  texte: string
  uidGouvernance: string
}>
