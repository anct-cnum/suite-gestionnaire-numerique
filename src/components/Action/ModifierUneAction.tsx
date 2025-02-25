'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { FormulaireAction } from './FormulaireAction'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { ActionViewModel } from '@/presenters/actionPresenter'

export default function ModifierUneAction({ action }: Props): ReactElement {
  const { modifierUneActionAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <FormulaireAction
      action={action}
      label=" Modifier une action"
      validerFormulaire={modifierAction}
    >
      <SubmitButton
        className="fr-col-11 fr-mb-5w d-block"
        isDisabled={isDisabled}
      >
        {isDisabled ? 'Modification en cours...' : 'Valider et envoyer'}
      </SubmitButton>
    </FormulaireAction>
  )

  async function modifierAction(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string
  ): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const messages = await modifierUneActionAction({
      anneeDeDebut: form.get('anneeDeDebut') as string,
      anneeDeFin: form.get('anneeDeFin') as string,
      budgetGlobal: Number(form.get('budgetGlobal')),
      contexte: contexteContenu,
      description: descriptionContenu,
      destinataires: [],
      nom: form.get('nom') as string,
      porteur: '',
      temporalite: form.get('radio-pluriannuelle') as string,
      uid: '',
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiée', title: 'Action ' })
    } else {
      Notification('error', { description: messages.join(', '), title: 'Erreur : ' })
    }
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  action: ActionViewModel
}>
