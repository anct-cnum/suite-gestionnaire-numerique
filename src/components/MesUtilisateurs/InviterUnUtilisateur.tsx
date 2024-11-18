'use client'

import { Dispatch, FormEvent, ReactElement, RefObject, SetStateAction, useContext, useId, useState } from 'react'

import OrganisationInput, { OrganisationOption } from './OrganisationInput'
import departements from '../../../ressources/departements.json'
import groupements from '../../../ressources/groupements.json'
import regions from '../../../ressources/regions.json'
import { inviterUnUtilisateurAction } from '../../app/api/actions/inviterUnUtilisateurAction'
import Badge from '../shared/Badge/Badge'
import { clientContext } from '../shared/ClientContext'
import { Notification } from '../shared/Notification/Notification'
import RadioGroup from '../shared/Radio/RadioGroup'
import TextInput from '../shared/TextInput/TextInput'
import { emailPattern } from '@/shared/patterns'

// TODO: A DEPLACER DANS LE DOMAINE
const rolesAvecStructure: RolesAvecStructure = {
  'Gestionnaire département': {
    label: 'Département',
    options: departements.map((departement) => ({ id: departement.code, label: departement.nom })),
  },
  'Gestionnaire groupement': {
    label: 'Groupement',
    options: groupements.map((groupement) => ({ id: groupement.nom, label: groupement.nom })),
  },
  'Gestionnaire région': {
    label: 'Région',
    options: regions.map((region) => ({ id: region.code, label: region.nom })),
  },
  'Gestionnaire structure': {
    label: 'Structure',
    options: [],
  },
}

export default function InviterUnUtilisateur({
  setIsOpen,
  labelId,
  dialogRef,
}: InviterUnUtilisateurProps): ReactElement {
  const [emailDejaExistant, setEmailDejaExistant] = useState('')
  const { sessionUtilisateurViewModel } = useContext(clientContext)
  const [roleSelectionne, setRoleSelectionne] = useState('')
  const [organisation, setOrganisation] = useState<OrganisationOption | null>(null)
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const structureId = useId()
  const gestionnaires = sessionUtilisateurViewModel.role.rolesGerables.map((roleGerable) => ({
    id: roleGerable,
    label: roleGerable,
  }))

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
          pattern={emailPattern.source}
          required={true}
          type="email"
        >
          Adresse électronique
          {' '}
          <span className="color-red">
            *
          </span>
          <span className="fr-hint-text">
            Une invitation lui sera envoyée par e-mail
          </span>
        </TextInput>
        {
          gestionnaires.length > 1 ?
            <>
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
                onChange={(event) => {
                  setRoleSelectionne(event.target.value)
                }}
                options={gestionnaires}
              />
            </>
            :
            <>
              <p className="fr-mb-1w">
                Rôle attribué à cet utilisateur :
              </p>
              <Badge color="purple-glycine">
                {gestionnaires[0]?.label}
              </Badge>
            </>
        }
        {
          isStructureDisplayed() ?
            <OrganisationInput
              label={rolesAvecStructure[roleSelectionne].label}
              options={rolesAvecStructure[roleSelectionne].options}
              organisation={organisation}
              setOrganisation={setOrganisation}
              structureId={structureId}
            /> : null
        }
        <button
          className="fr-btn fr-my-2w drawer-invitation-button"
          data-fr-opened="false"
          type="submit"
        >
          Envoyer l’invitation
        </button>
      </form>
    </div>
  )

  async function inviterUtilisateur(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [nom, prenom, email, role] = [...form.values()].map((value) => value as string)
    const result = await inviterUnUtilisateurAction({ email, nom, organisation: organisation?.label, prenom, role })
    if (result === 'emailExistant') {
      setEmailDejaExistant('Cet utilisateur dispose déjà d’un compte')
    } else {
      if (result === 'OK') {
        Notification('success', { description: email, title: 'Invitation envoyée à ' })
        setEmailDejaExistant('')
      }
      fermerEtReinitialiser(event.target as HTMLFormElement)
    }
  }

  function isStructureDisplayed(): boolean {
    return gestionnaires.length > 1 && Object.keys(rolesAvecStructure).includes(roleSelectionne)
  }

  function fermerEtReinitialiser(htmlFormElement: HTMLFormElement): void {
    setIsOpen(false)
    window.dsfr(dialogRef.current).modal.conceal()
    htmlFormElement.reset()
  }
}

type InviterUnUtilisateurProps = Readonly<{
  setIsOpen: Dispatch<SetStateAction<boolean>>
  labelId: string
  dialogRef: RefObject<HTMLDialogElement>
}>

type RolesAvecStructure = Readonly<Record<string, {
  label: string,
  options: Array<{id: string, label: string}>
}>>
