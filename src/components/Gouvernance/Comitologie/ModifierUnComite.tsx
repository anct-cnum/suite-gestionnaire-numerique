import { FormEvent, ReactElement, useContext, useState } from 'react'

import FormulaireComite from './FormulaireComite'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'
import { ComiteViewModel } from '@/presenters/gouvernancePresenter'

export default function ModifierUnComite({
  closeDrawer,
  comite,
  id,
  label,
  labelId,
  peutGerer,
  uidGouvernance,
}: Props): ReactElement {
  const { modifierUnComiteAction, pathname, supprimerUnComiteAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <>
      <FormulaireComite
        comite={comite}
        label={label}
        labelId={labelId}
        peutGerer={peutGerer}
        validerFormulaire={modifierUnComite}
      >
        {peutGerer ?
          <>
            <SubmitButton
              ariaControls={id}
              isDisabled={isDisabled}
            >
              {isDisabled ? 'Modification en cours...' : 'Enregistrer'}
            </SubmitButton>
            <button
              aria-controls={id}
              className="fr-btn red-button"
              disabled={isDisabled}
              onClick={supprimerUnComite}
              type="button"
            >
              {isDisabled ? 'Suppression en cours...' : 'Supprimer'}
            </button>
          </>
          : null}
      </FormulaireComite>
      <p className="fr-text--xs center">
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
      Notification('success', { description: 'modifié', title: 'Comité ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setIsDisabled(false)
  }

  async function supprimerUnComite(): Promise<void> {
    setIsDisabled(true)
    const messages = await supprimerUnComiteAction({
      path: pathname,
      uid: String(comite.uid),
      uidGouvernance,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'supprimé', title: 'Comité ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  closeDrawer(): void
  comite: ComiteViewModel
  id: string
  label: string
  labelId: string
  peutGerer: boolean
  uidGouvernance: string
}>
