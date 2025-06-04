'use client'

import { FormEvent, ReactElement, useContext, useState } from 'react'

import { FormulaireAction } from './FormulaireAction'
import { gouvernanceContext } from '../shared/GouvernanceContext'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { ActionViewModel, DemandeDeSubvention } from '@/presenters/actionPresenter'

export function BaseActionForm({
  action,
  date,
  formLabel,
  onSubmit,
  onSuccess,
  submitButtonLoadingText,
  submitButtonText,
  title,
  uidFeuilleDeRoute,
}: BaseActionFormProps): ReactElement {
  const [isDisabled, setIsDisabled] = useState(false)
  const [demandeDeSubvention, setDemandeDeSubvention] = useState(action.demandeDeSubvention)
  const { gouvernanceViewModel } = useContext(gouvernanceContext)

  return (
    <>
      <title>
        {title}
      </title>
      <FormulaireAction
        action={action}
        ajouterDemandeDeSubvention={ajouterDemandeDeSubvention}
        date={date}
        demandeDeSubvention={demandeDeSubvention}
        label={formLabel}
        supprimerUneDemandeDeSubvention={supprimerDemandeDeSubvention}
        validerFormulaire={async (event, contexte, description, coFinancements) => 
          handleSubmit(event, contexte, description, coFinancements)}
      >
        <SubmitButton
          className="fr-col-11 fr-mb-5w d-block"
          isDisabled={isDisabled}
        >
          {isDisabled ? submitButtonLoadingText : submitButtonText}
        </SubmitButton>
      </FormulaireAction>
    </>
  )

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string,
    coFinancements: Array<{
      coFinanceur: string
      montant: string
    }>
  ): Promise<void> {
    setIsDisabled(true)
    try {
      await onSubmit(event, contexteContenu, descriptionContenu, coFinancements, demandeDeSubvention)
      onSuccess?.()
    } finally {
      setIsDisabled(false)
    }
  }

  function ajouterDemandeDeSubvention(demandeDeSubvention: DemandeDeSubvention): void {
    setDemandeDeSubvention(demandeDeSubvention)
  }

  function supprimerDemandeDeSubvention(): void {
    setDemandeDeSubvention(undefined)
  }
}

type BaseActionFormProps = Readonly<{
  action: ActionViewModel
  date: Date
  formLabel: string
  onSubmit(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string,
    coFinancements: Array<{
      coFinanceur: string
      montant: string
    }>,
    demandeDeSubvention: DemandeDeSubvention | undefined
  ): Promise<void>
  onSuccess?(): void
  submitButtonLoadingText: string
  submitButtonText: string
  title: string
  uidFeuilleDeRoute: string
}> 