'use client'

import { Dispatch, FormEvent, ReactElement, RefObject, SetStateAction, useContext, useId, useState } from 'react'

import { inviterUnUtilisateurAction } from '../../app/api/actions/inviterUnUtilisateurAction'
import Badge from '../shared/Badge/Badge'
import { clientContext } from '../shared/ClientContext'
import RadioGroup from '../shared/Radio/RadioGroup'
import TextInput from '../shared/TextInput/TextInput'

// A DEPLACER DANS LE DOMAINE
const rolesAvecStructure = ['Gestionnaire département', 'Gestionnaire région', 'Gestionnaire groupement', 'Gestionnaire structure']

export default function InviterUnUtilisateur({
  setIsOpen,
  labelId,
  dialogRef,
}: InviterUnUtilisateurProps): ReactElement {
  const [emailDejaExistant, setEmailDejaExistant] = useState('')
  const { setBandeauInformations, sessionUtilisateurViewModel } = useContext(clientContext)
  const [roleSelectionne, setRoleSelectionne] = useState('')
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
        {'Les champs avec '}
        <span className="color-red">
          *
        </span>
        {' sont obligatoires.'}
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
          {'Nom '}
          <span className="color-red">
            *
          </span>
        </TextInput>
        <TextInput
          id={prenomId}
          name="prenom"
          required={true}
        >
          {'Prénom '}
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
          {'Adresse électronique '}
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
                {'Quel rôle souhaitez-vous lui attribuer ? '}
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
            <TextInput
              id={structureId}
              name="structure"
              required={true}
            >
              {'Structure '}
              <span className="color-red">
                *
              </span>
            </TextInput> : null
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
    const [nom, prenom, email, role, organisation] = [...form.values()].map((value) => value as string)
    const result = await inviterUnUtilisateurAction({ email, nom, organisation, prenom, role })
    if (result === 'emailExistant') {
      setEmailDejaExistant('Cet utilisateur dispose déjà d’un compte')
    } else {
      if (result === 'OK') {
        setBandeauInformations({ description: email, titre: 'Invitation envoyée à ' })
        setEmailDejaExistant('')
      }
      fermerEtReinitialiser(event.target as HTMLFormElement)
    }
  }

  function isStructureDisplayed(): boolean {
    return gestionnaires.length > 1 && rolesAvecStructure.includes(roleSelectionne)
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
