'use client'

import { Dispatch, FormEvent, ReactElement, ReactNode, RefObject, SetStateAction, useContext, useId, useState } from 'react'

import OrganisationInput from './OrganisationInput'
import Badge from '../shared/Badge/Badge'
import { clientContext } from '../shared/ClientContext'
import { Notification } from '../shared/Notification/Notification'
import RadioGroup from '../shared/Radio/RadioGroup'
import TextInput from '../shared/TextInput/TextInput'
import { RolesAvecStructure } from '@/presenters/mesUtilisateursPresenter'
import { emailPattern } from '@/shared/patterns'

export default function InviterUnUtilisateur({
  setIsOpen,
  labelId,
  dialogRef,
  rolesAvecStructure,
}: InviterUnUtilisateurProps): ReactElement {
  const [emailDejaExistant, setEmailDejaExistant] = useState<Erreur>()
  const { inviterUnUtilisateurAction, sessionUtilisateurViewModel } = useContext(clientContext)
  const [roleSelectionne, setRoleSelectionne] = useState('')
  const [organisation, setOrganisation] = useState<string>('')
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const rolesGerables = sessionUtilisateurViewModel.role.rolesGerables.map((roleGerable) => ({
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
        aria-label="Inviter un utilisateur"
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
          ariaDescribedById="text-input-error-desc-error"
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
          rolesGerables.length > 1 ?
            <fieldset
              className="fr-fieldset"
              id="attributionRole"
            >
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
                  setOrganisation('')
                }}
                options={rolesGerables}
              />
            </fieldset>
            :
            <>
              <p className="fr-mb-1w">
                Rôle attribué à cet utilisateur :
              </p>
              <Badge color="purple-glycine">
                {rolesGerables[0]?.label}
              </Badge>
            </>
        }
        {
          isOrganisationDisplayed(roleSelectionne, rolesAvecStructure) ?
            <OrganisationInput
              label={rolesAvecStructure[roleSelectionne].label}
              options={rolesAvecStructure[roleSelectionne].options}
              organisation={organisation}
              required={true}
              setOrganisation={setOrganisation}
            /> : null
        }
        <button
          className="fr-btn fr-my-2w center-button"
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
    const [nom, prenom, email, role, codeOrganisation] = [...form.values()].map((value) => value as string)
    const messages = await inviterUnUtilisateurAction({ codeOrganisation, email: email, nom, prenom, role })
    if (messages[0] === 'emailExistant') {
      setEmailDejaExistant({
        className: 'fr-input-group--error',
        content: (
          <p
            className="fr-error-text"
            id="text-input-error-desc-error"
          >
            Cet utilisateur dispose déjà d’un compte
          </p>
        ),
      })
    } else {
      if (messages[0] === 'OK') {
        Notification('success', { description: email, title: 'Invitation envoyée à ' })
        setEmailDejaExistant(undefined)
      }
      fermerEtReinitialiser(event.target as HTMLFormElement)
    }
  }

  function fermerEtReinitialiser(htmlFormElement: HTMLFormElement): void {
    setIsOpen(false)
    setRoleSelectionne('')
    window.dsfr(dialogRef.current).modal.conceal()
    htmlFormElement.reset()
  }

  function isOrganisationDisplayed(roleSelectionne: string, rolesAvecStructure: RolesAvecStructure): boolean {
    return Object.keys(rolesAvecStructure).includes(roleSelectionne)
  }
}

type InviterUnUtilisateurProps = Readonly<{
  setIsOpen: Dispatch<SetStateAction<boolean>>
  labelId: string
  dialogRef: RefObject<HTMLDialogElement>
  rolesAvecStructure: RolesAvecStructure
}>

type Erreur = Readonly<{
  content: ReactNode
  className: string
}>
