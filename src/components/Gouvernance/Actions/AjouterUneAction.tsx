'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { FormulaireAction } from './FormulaireAction'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { ActionViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function AjouterUneAction({ action, date }: Props): ReactElement {
  const { ajouterUneActionAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <FormulaireAction
      action={action}
      date={date}
      isDisabled={isDisabled}
      label="Ajouter une action à la feuille de route"
      validerFormulaire={creerUneAction}
    />
  )

  // istanbul ignore next @preserve
  async function creerUneAction(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string
  ): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const [nom, temporalite, anneeDeDebut, budgetGlobal] = form.values() as FormDataIterator<string>
    const messages = await ajouterUneActionAction({
      anneeDeDebut,
      anneeDeFin: temporalite === 'pluriannuelle' ? form.get('anneeDeFin') as string : null,
      budgetGlobal: Number(budgetGlobal),
      contexte: contexteContenu,
      description: descriptionContenu,
      nom,
      temporalite,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'ajouté', title: 'Action ' })
    } else {
      Notification('error', { description: messages.join(', '), title: 'Erreur : ' })
    }
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }
}

type Props = {
  readonly date: Date
  readonly action: ActionViewModel
}
