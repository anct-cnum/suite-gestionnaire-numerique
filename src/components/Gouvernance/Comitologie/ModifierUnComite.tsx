import { FormEvent, ReactElement, RefObject, useState } from 'react'

import FormulaireComite from './FormulaireComite'
import styles from '../Gouvernance.module.css'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'
import { ComiteViewModel } from '@/presenters/gouvernancePresenter'

export default function ModifierUnComite({
  comite,
  dialogRef,
  label,
  labelId,
  closeDrawer,
}: Props): ReactElement {
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <>
      <FormulaireComite
        comite={comite}
        label={label}
        labelId={labelId}
        validerFormulaire={modifierUnComite}
      >
        <div className="fr-btns-group fr-btns-group--space-between">
          <div className="fr-col-5">
            <SubmitButton
              className="red-button"
              isDisabled={isDisabled}
              label="Supprimer"
            />
          </div>
          <div className="fr-col-5">
            <SubmitButton
              isDisabled={isDisabled}
              label="Enregistrer"
            />
          </div>
        </div>
      </FormulaireComite>
      <p className={`fr-text--xs ${styles.center}`}>
        Modifié le
        {' '}
        {comite.derniereEdition}
        {' '}
        par
        {' '}
        {comite.editeur}
      </p>
    </>
  )

  function modifierUnComite(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    setIsDisabled(true)
    closeDrawer()
    window.dsfr(dialogRef.current).modal.conceal();
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  comite: ComiteViewModel
  dialogRef: RefObject<HTMLDialogElement | null>
  label: string
  labelId: string
  closeDrawer(): void
}>
