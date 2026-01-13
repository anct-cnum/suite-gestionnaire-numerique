'use client'

import { FormEvent, ReactElement, useContext, useId, useState } from 'react'

import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { Notification } from '../shared/Notification/Notification'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import TextInput from '../shared/TextInput/TextInput'
import { StructureViewModel } from '@/presenters/structurePresenter'
import { emailPattern, telephonePattern } from '@/shared/patterns'

export default function ModifierContactReferentStructure({
  closeDrawer,
  contactReferent,
  id,
  labelId,
  structureId,
}: Props): ReactElement {
  const { modifierContactReferentStructureAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const telephoneId = useId()
  const fonctionId = useId()

  return (
    <>
      <DrawerTitle id={labelId}>
        Modifier le contact
      </DrawerTitle>
      <p className="fr-text--sm color-grey">
        Les champs avec
        {' '}
        <span className="color-red">
          *
        </span>
        {' '}
        sont obligatoires.
      </p>
      <form
        aria-label="Modifier le contact référent"
        method="dialog"
        onSubmit={modifierContact}
      >
        <TextInput
          defaultValue={contactReferent.nom}
          id={nomId}
          name="nom"
          required={true}
        >
          Nom
          {' '}
          <span className="color-red">
            *
          </span>
        </TextInput>
        <TextInput
          defaultValue={contactReferent.prenom}
          id={prenomId}
          name="prenom"
          required={true}
        >
          Prénom
          {' '}
          <span className="color-red">
            *
          </span>
        </TextInput>
        <TextInput
          defaultValue={contactReferent.email}
          id={emailId}
          name="email"
          pattern={emailPattern.source}
          required={true}
          type="email"
        >
          Adresse électronique
          {' '}
          <span className="color-red">
            *
          </span>
        </TextInput>
        <TextInput
          defaultValue={contactReferent.telephone}
          id={telephoneId}
          name="telephone"
          pattern={telephonePattern.source}
          required={false}
          type="tel"
        >
          Téléphone professionnel
          {' '}
          <span className="fr-hint-text">
            Formats attendus : 0122334455 ou +33122334455
          </span>
        </TextInput>
        <TextInput
          defaultValue={contactReferent.fonction}
          id={fonctionId}
          name="fonction"
          required={true}
        >
          Fonction
          {' '}
          <span className="color-red">
            *
          </span>
        </TextInput>
        <div className="fr-btns-group fr-btns-group--space-between">
          <div className="fr-col-5">
            <button
              aria-controls={id}
              className="fr-btn fr-btn--secondary"
              onClick={closeDrawer}
              type="reset"
            >
              Annuler
            </button>
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
      </form>
    </>
  )

  async function modifierContact(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [nom, prenom, email, telephone, fonction] = form.values() as FormDataIterator<string>

    setIsDisabled(true)

    const messages = await modifierContactReferentStructureAction({
      email,
      fonction,
      nom,
      path: pathname,
      prenom,
      structureId,
      telephone,
    })

    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiées', title: 'Informations du contact référent ' })
      closeDrawer()
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }

    setIsDisabled(false)
  }
}

type Props = Readonly<{
  closeDrawer(): void
  contactReferent: StructureViewModel['contactReferent']
  id: string
  labelId: string
  structureId: number
}>
