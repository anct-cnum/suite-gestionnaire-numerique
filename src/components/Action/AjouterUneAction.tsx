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
    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const messages = await ajouterUneActionAction({
      anneeDeDebut: form.get('anneeDeDebut') as string,
      anneeDeFin: form.get('anneeDeFin') as string,
      budgetGlobal: Number(form.get('budgetGlobal')),
      contexte: contexteContenu,
      description: descriptionContenu,
      destinataires: [],
      nom: form.get('nom') as string,
      porteur: '',
      temporalite: form.get('radio-pluriannuelle') as string,
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
