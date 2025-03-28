import { FormEvent, ReactElement, useContext, useState } from 'react'

import FormulaireNotePrivee from './FormulaireNotePrivee'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'

export default function AjouterUneNotePrivee({
  closeDrawer,
  id,
  labelId,
  uidGouvernance,
}: Props): ReactElement {
  const { ajouterUneNotePriveeAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <FormulaireNotePrivee
      labelId={labelId}
      texte=""
      validerFormulaire={creerUneNotePrivee}
    >
      <div className="fr-btns-group">
        <SubmitButton
          ariaControls={id}
          isDisabled={isDisabled}
        >
          {isDisabled ? 'Ajout en cours...' : 'Enregistrer'}
        </SubmitButton>
      </div>
    </FormulaireNotePrivee>
  )

  async function creerUneNotePrivee(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [contenu] = form.values() as FormDataIterator<string>
    setIsDisabled(true)
    const messages = await ajouterUneNotePriveeAction({
      contenu,
      path: pathname,
      uidGouvernance,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'ajoutée', title: 'Note privée ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  closeDrawer(): void
  id: string
  labelId: string
  uidGouvernance: string
}>
