'use client'

import { FormEvent, ReactElement, useState } from 'react'

import { FormulaireAction } from './FormulaireAction'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { ActionViewModel, DemandeDeSubvention } from '@/presenters/actionPresenter'

export function BaseActionForm({
  action,
  date,
  formLabel,
  onSubmit,
  submitButtonLoadingText,
  submitButtonText,
  title,
}: BaseActionFormProps): ReactElement {
  const [isDisabled, setIsDisabled] = useState(false)
  const [demandeDeSubvention, setDemandeDeSubvention] = useState(action.demandeDeSubvention)
  const isReadOnly = !onSubmit

  return (
    <>
      <title>
        {title}
      </title>
      <FormulaireAction
        action={action}
        ajouterDemandeDeSubvention={isReadOnly ? undefined : ajouterDemandeDeSubvention}
        date={date}
        demandeDeSubvention={demandeDeSubvention}
        isReadOnly={isReadOnly}
        label={formLabel}
        supprimerUneDemandeDeSubvention={isReadOnly ? undefined : supprimerDemandeDeSubvention}
        validerFormulaire={isReadOnly ? undefined : 
          async (event, contexte, description, coFinancements): Promise<void> => 
            handleSubmit(event, contexte, description, coFinancements)}
      >
        {!isReadOnly && (
          <SubmitButton
            className="fr-col-11 fr-mb-5w d-block"
            isDisabled={isDisabled}
          >
            {isDisabled ? submitButtonLoadingText : submitButtonText}
          </SubmitButton>
        )}
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
    if (!onSubmit) {return}
    setIsDisabled(true)
    const success = await onSubmit(event, contexteContenu, descriptionContenu, coFinancements, demandeDeSubvention)
    if (!success) {
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
  onSubmit?(
    event: FormEvent<HTMLFormElement>,
    contexteContenu: string,
    descriptionContenu: string,
    coFinancements: Array<{
      coFinanceur: string
      montant: string
    }>,
    demandeDeSubvention: DemandeDeSubvention | undefined
  ): Promise<boolean>
  onSuccess?(): void
  submitButtonLoadingText?: string
  submitButtonText?: string
  title: string
}> 