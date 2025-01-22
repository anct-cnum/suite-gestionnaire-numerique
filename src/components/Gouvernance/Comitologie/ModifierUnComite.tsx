import { FormEvent, ReactElement, useContext, useState } from 'react'

import FormulaireComite from './FormulaireComite'
import styles from '../Gouvernance.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'
import { ComiteViewModel } from '@/presenters/gouvernancePresenter'

export default function ModifierUnComite({
  comite,
  id,
  label,
  labelId,
  uidGouvernance,
  closeDrawer,
}: Props): ReactElement {
  const { modifierUnComiteAction, pathname } = useContext(clientContext)
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
            >
              Supprimer
            </SubmitButton>
          </div>
          <div className="fr-col-5">
            <SubmitButton
              ariaControls={id}
              isDisabled={isDisabled}
            >
              {isDisabled ? 'Modification en cours...' : 'Enregistrer'}
            </SubmitButton>
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

  async function modifierUnComite(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [type, frequence, date, commentaire, uid] = form.values() as FormDataIterator<string>
    setIsDisabled(true)
    const messages = await modifierUnComiteAction({
      commentaire,
      date: date === '' ? undefined : date,
      frequence,
      path: pathname,
      type,
      uid,
      uidGouvernance,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'bien modifié', title: 'Comité ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  comite: ComiteViewModel
  id: string
  label: string
  labelId: string
  uidGouvernance: string
  closeDrawer(): void
}>
