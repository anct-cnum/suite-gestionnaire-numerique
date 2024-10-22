'use client'

import { FormEvent, ReactElement, useContext, useId, useState } from 'react'

import { inviterUnUtilisateurAction } from '../../app/api/actions/inviterUnUtilisateurAction'
import { clientContext } from '../shared/ClientContext'
import RadioGroup, { RadioOption } from '../shared/Radio/RadioGroup'
import TextInput from '../shared/TextInput/TextInput'

export default function InviterUnUtilisateur({
  setIsOpen,
  drawerId,
  labelId,
}: InviterUnUtilisateurProps): ReactElement {
  const [emailDejaExistant, setEmailDejaExistant] = useState<string | undefined>()
  const { setBandeauInformations } = useContext(clientContext)
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const structureId = useId()

  const inviterUtilisateur = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const email = form.get('email') as string
    const utilisateurACreer = {
      email,
      nom: form.get('nom') as string,
      organisation: form.get('structure') as string,
      prenom: form.get('prenom') as string,
      role: form.get('attributionRole') as string,
    }
    const result = await inviterUnUtilisateurAction(utilisateurACreer)
    if (result === 'emailExistant') {
      setEmailDejaExistant('Cet utilisateur dispose déjà d’un compte')
    } else {
      if (result === 'OK') {
        setBandeauInformations({ description: email, titre: 'Invitation envoyée à ' })
        setEmailDejaExistant(undefined)
      }
      fermerEtReinitialiser(event.target as HTMLFormElement)
    }
  }

  return (
    <div>
      <h1
        className="fr-h2 color-blue-france"
        id={labelId}
      >
        Invitez un utilisateur à rejoindre l’espace de gestion
      </h1>
      <p id="champsObligatoires">
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
        onSubmit={inviterUtilisateur}
      >
        <TextInput
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
          erreur={emailDejaExistant}
          id={emailId}
          name="email"
          pattern=".+@.+\..{2,}"
          required={true}
          type="email"
        >
          Adresse électronique
          {' '}
          <span className="color-red">
            *
          </span>
        </TextInput>
        <legend
          aria-describedby="champsObligatoires"
          className="fr-mb-2w"
        >
          Quel rôle souhaitez-vous lui attribuer ?
          {' '}
          <span className="color-red">
            *
          </span>
        </legend>
        <RadioGroup
          nomGroupe="attributionRole"
          options={gestionnaires}
        />
        <TextInput
          id={structureId}
          name="structure"
          required={true}
        >
          Structure
          {' '}
          <span className="color-red">
            *
          </span>
        </TextInput>
        <button
          //aria-controls={ariaControls}
          className="fr-btn fr-my-2w drawer-invitation-button"
          data-fr-opened="false"
          type="submit"
        >
          Envoyer l’invitation
        </button>
      </form>
    </div>
  )

  function fermerEtReinitialiser(htmlFormElement: HTMLFormElement): void {
    setIsOpen(false)
    window.dsfr(document.getElementById(drawerId)).modal.conceal()
    htmlFormElement.reset()
  }
}

type InviterUnUtilisateurProps = Readonly<{
  setIsOpen: (isOpen: boolean) => void
  drawerId: string
  labelId: string
}>

const gestionnaires: ReadonlyArray<RadioOption> = [
  {
    id: 'Gestionnaire région',
    label: 'Gestionnaire région',
  },
  {
    id: 'Gestionnaire département',
    label: 'Gestionnaire département',
  },
  {
    id: 'Gestionnaire groupement',
    label: 'Gestionnaire groupement',
  },
  {
    id: 'Gestionnaire structure',
    label: 'Gestionnaire structure',
  },
]
