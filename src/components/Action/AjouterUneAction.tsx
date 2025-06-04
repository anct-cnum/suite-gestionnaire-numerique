'use client'

import { FormEvent, ReactElement, useContext } from 'react'

import { handleActionResponse, handleActionSubmit } from './actionUtils'
import { BaseActionForm } from './BaseActionForm'
import { gouvernanceContext } from '../shared/GouvernanceContext'
import { clientContext } from '@/components/shared/ClientContext'
import { ActionViewModel, DemandeDeSubvention } from '@/presenters/actionPresenter'

export default function AjouterUneAction({ action, date, uidFeuilleDeRoute }: Props): ReactElement {
  const { ajouterUneActionAction, pathname } = useContext(clientContext)
  const { gouvernanceViewModel } = useContext(gouvernanceContext)

  return (
    <BaseActionForm
      action={action}
      date={date}
      formLabel="Ajouter une action à la feuille de route"
      onSubmit={creerUneAction}
      submitButtonLoadingText="Ajout en cours..."
      submitButtonText="Valider et envoyer"
      title="Ajouter une action à la feuille de route"
      uidFeuilleDeRoute={uidFeuilleDeRoute}
    />
  )

  async function creerUneAction(
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
    const data = await handleActionSubmit(
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
      }
    )
    
    const messages = await ajouterUneActionAction(data)
    handleActionResponse(messages, gouvernanceViewModel.uid, uidFeuilleDeRoute, false)
  }
}

type Props = Readonly<{
  action: ActionViewModel
  date: Date
  uidFeuilleDeRoute: string
}>
