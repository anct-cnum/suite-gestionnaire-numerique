'use client'

import { FormEvent, ReactElement, useContext, useId, useState } from 'react'

import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { Notification } from '../shared/Notification/Notification'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import TextInput from '../shared/TextInput/TextInput'
import { emailPattern, telephonePattern } from '@/shared/patterns'

export default function ModifierMonCompte({
  closeDrawer,
  email,
  id,
  labelId,
  nom,
  prenom,
  telephone,
}: Props): ReactElement {
  const { modifierMesInformationsPersonnellesAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const telephoneId = useId()

  return (
    <>
      <DrawerTitle id={labelId}>
        Mes informations personnelles
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
        aria-label="Modifier"
        method="dialog"
        onSubmit={modifierMesInfosPersos}
      >
        <TextInput
          defaultValue={nom}
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
          defaultValue={prenom}
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
          defaultValue={email}
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
          {' '}
          <span className="fr-hint-text">
            Seuls les administateurs et les préfectures verront votre adresse électronique.
          </span>
        </TextInput>
        <TextInput
          defaultValue={telephone}
          id={telephoneId}
          name="telephone"
          pattern={telephonePattern.source}
          required={false}
          type="tel"
        >
          Téléphone professionnel
          {' '}
          <span className="fr-hint-text">
            Seuls les administrateurs et les préfectures verront votre numéro de téléphone. 
            Formats attendus : 0122334455 ou +33122334455
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

  async function modifierMesInfosPersos(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [nom, prenom, email, telephone] = form.values() as FormDataIterator<string>

    setIsDisabled(true)

    const messages = await modifierMesInformationsPersonnellesAction({
      emailDeContact: email,
      nom,
      path: pathname,
      prenom,
      telephone,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'modifiées', title: 'Informations personnelles ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setIsDisabled(false)
  }
}

type Props = Readonly<{
  closeDrawer(): void
  email: string
  id: string
  labelId: string
  nom: string
  prenom: string
  telephone: string
}>
