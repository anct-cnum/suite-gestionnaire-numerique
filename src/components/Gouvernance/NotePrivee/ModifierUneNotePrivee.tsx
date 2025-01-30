import { FormEvent, ReactElement, useContext, useState } from 'react'

import FormulaireNotePrivee from './FormulaireNotePrivee'
import styles from '../Gouvernance.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'

export default function ModifierUneNotePrivee({
  edition,
  id,
  labelId,
  texte,
  uidGouvernance,
  closeDrawer,
}: Props): ReactElement {
  const { modifierUneNotePriveeAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <FormulaireNotePrivee
      labelId={labelId}
      texte={texte}
      validerFormulaire={modifierLaNotePrivee}
    >
      <div className="fr-btns-group">
        <SubmitButton
          ariaControls={id}
          isDisabled={isDisabled}
        >
          {isDisabled ? 'Modification en cours...' : 'Enregistrer'}
        </SubmitButton>
        <button
          className="fr-btn red-button"
          type="reset"
        >
          Effacer
        </button>
      </div>
      <p className={`fr-text--xs ${styles.center}`}>
        {edition}
      </p>
    </FormulaireNotePrivee>
  )

  async function modifierLaNotePrivee(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [contenu] = form.values() as FormDataIterator<string>
    setIsDisabled(true)
    const messages = await modifierUneNotePriveeAction({
      contenu,
      path: pathname,
      uidGouvernance,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'bien modifiée', title: 'Note privée ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  edition: string
  id: string
  labelId: string
  texte: string
  uidGouvernance: string
  closeDrawer(): void
}>
