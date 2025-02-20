'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { FormulaireAction } from './FormulaireAction'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { ActionViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function ModifierUneAction({ action }: Props): ReactElement {
  const { modifierUneActionAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <FormulaireAction
      action={action}
      isDisabled={isDisabled}
      label=" Modifier une action"
      validerFormulaire={modifierAction}
    />
  )

  // istanbul ignore next @preserve
  async function modifierAction(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string
  ): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const [nom, anneeDeDebut, temporalite, anneeDeFin, budgetGlobal] = form.values() as FormDataIterator<string>

    const messages = await modifierUneActionAction({
      anneeDeDebut,
      anneeDeFin,
      budgetGlobal: Number(budgetGlobal),
      contexte: contexteContenu,
      description: descriptionContenu,
      nom,
      temporalite,
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
