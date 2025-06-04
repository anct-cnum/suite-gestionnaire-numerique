'use client'

import { FormEvent, ReactElement, useContext } from 'react'

import { ActionDataWithUid, handleActionResponse, handleActionSubmit } from './actionUtils'
import { BaseActionForm } from './BaseActionForm'
import { gouvernanceContext } from '../shared/GouvernanceContext'
import { clientContext } from '@/components/shared/ClientContext'
import { ActionViewModel, DemandeDeSubvention } from '@/presenters/actionPresenter'

export default function ModifierUneAction({ action, date, uidFeuilleDeRoute }: Props): ReactElement {
  const { modifierUneActionAction, pathname } = useContext(clientContext)
  const { gouvernanceViewModel } = useContext(gouvernanceContext)

  return (
    <BaseActionForm
      action={action}
      date={date}
      formLabel="Modifier une action"
      onSubmit={modifierAction}
      submitButtonLoadingText="Modification en cours..."
      submitButtonText="Valider et envoyer"
      title={`Modifier l'action ${action.nom}`}
    />
  )

  async function modifierAction(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string,
    coFinancements: Array<{
      coFinanceur: string
      montant: string
    }>,
    demandeDeSubvention: DemandeDeSubvention | undefined
  ): Promise<void> {
    const form = new FormData(event.currentTarget)
    const data = handleActionSubmit(
      event,
      contexteContenu,
      descriptionContenu,
      coFinancements,
      demandeDeSubvention,
      form,
      {
        feuilleDeRoute: uidFeuilleDeRoute,
        gouvernance: gouvernanceViewModel.uid,
        path: pathname,
      },
      action.uid
    ) as ActionDataWithUid
    
    const messages = await modifierUneActionAction(data)
    handleActionResponse(messages, gouvernanceViewModel.uid, uidFeuilleDeRoute, true)
  }
}

type Props = Readonly<{
  action: ActionViewModel
  date: Date
  uidFeuilleDeRoute: string
}>
