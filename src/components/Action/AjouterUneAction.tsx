'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { FormulaireAction } from './FormulaireAction'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import { ActionViewModel } from '@/presenters/actionPresenter'

export default function AjouterUneAction({ action, date }: Props): ReactElement {
  const { ajouterUneActionAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <FormulaireAction
      action={action}
      date={date}
      label="Ajouter une action à la feuille de route"
      validerFormulaire={creerUneAction}
    >
      <SubmitButton
        className="fr-col-11 fr-mb-5w d-block"
        isDisabled={isDisabled}
      >
        {isDisabled ? 'Ajout en cours...' : 'Valider et envoyer'}
      </SubmitButton>
    </FormulaireAction>
  )

  async function creerUneAction(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string
  ): Promise<void> {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const [nom, temporalite, anneeDeDebut, budgetGlobal] = form.values() as FormDataIterator<string>
    setIsDisabled(true)
    const messages = await ajouterUneActionAction({
      anneeDeDebut,
      anneeDeFin: form.get('anneeDeFin') as string | undefined,
      budgetGlobal: Number(budgetGlobal),
      contexte: contexteContenu,
      description: descriptionContenu,
      destinataires: [],
      nom,
      porteur: '',
      temporalite,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'ajoutée', title: 'Action ' })
    } else {
      Notification('error', { description: messages.join(', '), title: 'Erreur : ' })
    }
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  date: Date
  action: ActionViewModel
}>
