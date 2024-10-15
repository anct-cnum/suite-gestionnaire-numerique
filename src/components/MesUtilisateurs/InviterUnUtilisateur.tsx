'use client'

import { ReactElement, useId } from 'react'

import RadioGroup, { RadioOption } from '../shared/Radio/RadioGroup'
import TextInput from '../shared/TextInput/TextInput'

const gestionnaires: Array<RadioOption> = [
  {
    id: 'gestionnaireRegion',
    label: 'Gestionnaire région',
  },
  {
    id: 'gestionnaireDepartement',
    label: 'Gestionnaire département',
  },
  {
    id: 'gestionnaireGroupement',
    label: 'Gestionnaire groupement',
  },
  {
    id: 'gestionnaireStructure',
    label: 'Gestionnaire structure',
  },
]

export default function InviterUnUtilisateur({
  setIsOpen,
  ariaControls,
}: InviterUnUtilisateurProps): ReactElement {
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()

  const inviterUtilisateur = () => {
    setIsOpen(false)
  }

  return (
    <div>
      <h1 className="fr-h2 color-blue-france">
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
        <button
          aria-controls={ariaControls}
          className="fr-btn fr-my-2w drawer-invitation-button"
          data-fr-opened="false"
          type="submit"
        >
          Envoyer l’invitation
        </button>
      </form>
    </div>
  )
}

type InviterUnUtilisateurProps = Readonly<{
  setIsOpen: (isOpen: boolean) => void
  ariaControls: string
}>
