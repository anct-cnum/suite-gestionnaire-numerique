import { FormEvent, ReactElement, useContext, useState } from 'react'

import FormulaireComite from './FormulaireComite'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'
import { ComiteViewModel } from '@/presenters/gouvernancePresenter'

export default function AjouterUnComite({
  comite,
  id,
  labelId,
  uidGouvernance,
  closeDrawer,
}: Props): ReactElement {
  const { ajouterUnComiteAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <FormulaireComite
      comite={comite}
      label="Ajouter un comité"
      labelId={labelId}
      validerFormulaire={creerUnComite}
    >
      <SubmitButton
        ariaControls={id}
        isDisabled={isDisabled}
      >
        {isDisabled ? 'Ajout en cours...' : 'Enregistrer'}
      </SubmitButton>
    </FormulaireComite>
  )

  async function creerUnComite(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [type, frequence, date, commentaire] = form.values() as FormDataIterator<string>
    setIsDisabled(true)
    const messages = await ajouterUnComiteAction({
      commentaire,
      date: date === '' ? undefined : date,
      frequence,
      path: pathname,
      type,
      uidGouvernance,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'bien ajouté', title: 'Comité ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer();
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  comite: ComiteViewModel
  id: string
  labelId: string
  uidGouvernance: string
  closeDrawer(): void
}>
