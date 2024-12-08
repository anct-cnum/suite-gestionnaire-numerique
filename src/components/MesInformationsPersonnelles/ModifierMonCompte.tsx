'use client'

import { Dispatch, ReactElement, RefObject, SetStateAction, useActionState, useContext, useId } from 'react'

import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import TextInput from '../shared/TextInput/TextInput'
import { emailPattern, telephonePattern } from '@/shared/patterns'

export default function ModifierMonCompte({
  email,
  dialogRef,
  id,
  labelId,
  nom,
  prenom,
  setIsOpen,
  telephone,
}: ModifierMonCompteProps): ReactElement {
  const { modifierMesInformationsPersonnellesAction, pathname } = useContext(clientContext)
  const [_formState, formAction, pending] = useActionState(modifierMesInfosPersos, [])

  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const telephoneId = useId()

  return (
    <>
      <DrawerTitle id={labelId}>
        Mes informations personnelles
      </DrawerTitle>
      <p>
        Les champs avec
        {' '}
        <span className="color-red">
          *
        </span>
        {' '}
        sont obligatoires.
      </p>
      <form
        action={formAction}
        aria-label="Modifier"
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
            Seuls les gestionnaires verront votre adresse électronique.
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
            Seuls les gestionnaires verront votre numéro de téléphone.
            Formats attendus : 0122334455 ou +33122334455
          </span>
        </TextInput>
        <div className="fr-btns-group fr-btns-group--space-between">
          <button
            aria-controls={id}
            className="fr-btn fr-btn--secondary fr-col-5"
            onClick={() => {
              setIsOpen(false)
            }}
            type="reset"
          >
            Annuler
          </button>
          <button
            className="fr-btn fr-col-5"
            disabled={pending}
            type="submit"
          >
            {pending ? 'Modification en cours' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </>
  )

  async function modifierMesInfosPersos(_state: Array<string>, formData: FormData): Promise<void> {
    await modifierMesInformationsPersonnellesAction({ formData, path: pathname })
    setIsOpen(false)
    window.dsfr(dialogRef.current).modal.conceal()
  }
}

type ModifierMonCompteProps = Readonly<{
  dialogRef: RefObject<HTMLDialogElement | null>
  email: string
  id: string
  labelId: string
  nom: string
  prenom: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
  telephone: string
}>
