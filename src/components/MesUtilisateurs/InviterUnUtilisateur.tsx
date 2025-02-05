'use client'

import { FormEvent, ReactElement, ReactNode, RefObject, useContext, useId, useState } from 'react'

import OrganisationInput from './OrganisationInput'
import Badge from '../shared/Badge/Badge'
import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { Notification } from '../shared/Notification/Notification'
import RadioGroup from '../shared/Radio/RadioGroup'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import TextInput from '../shared/TextInput/TextInput'
import { RolesAvecStructure } from '@/presenters/mesUtilisateursPresenter'
import { emailPattern } from '@/shared/patterns'

export default function InviterUnUtilisateur({
  closeDrawer,
  labelId,
  dialogRef,
  rolesAvecStructure,
}: Props): ReactElement {
  const [emailDejaExistant, setEmailDejaExistant] = useState<Erreur>()
  const { inviterUnUtilisateurAction, pathname, sessionUtilisateurViewModel } = useContext(clientContext)
  const [roleSelectionne, setRoleSelectionne] = useState('')
  const [organisation, setOrganisation] = useState<string>('')
  const [isDisabled, setIsDisabled] = useState(false)
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const rolesGerables = sessionUtilisateurViewModel.role.rolesGerables.map((roleGerable) => ({
    id: roleGerable,
    label: roleGerable,
  }))

  return (
    <div>
      <DrawerTitle id={labelId}>
        Invitez un utilisateur à rejoindre l’espace de gestion
      </DrawerTitle>
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
              placeholder={rolesAvecStructure[roleSelectionne].placeholder}
              required={true}
              setOrganisation={setOrganisation}
            /> : null
        }
        <div className="fr-btns-group fr-mt-2w">
          <SubmitButton isDisabled={isDisabled}>
            {isDisabled ? 'Envois en cours...' : 'Envoyer l’invitation'}
          </SubmitButton>
        </div>
      </form>
    </div>
  )

  async function inviterUtilisateur(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    setIsDisabled(true)
    const form = new FormData(event.currentTarget)
    const [nom, prenom, email, role, codeOrganisation] = form.values() as FormDataIterator<string>
    const messages = await inviterUnUtilisateurAction({
      codeOrganisation,
      email,
      nom,
      path: pathname,
      prenom,
      role,
    })
    if (messages.includes('emailExistant')) {
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
      if (messages.includes('OK')) {
        Notification('success', { description: email, title: 'Invitation envoyée à ' })
        setEmailDejaExistant(undefined)
      } else {
        Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
      }
      fermerEtReinitialiser(event.target as HTMLFormElement)
    }
    setIsDisabled(false)
  }

  function fermerEtReinitialiser(htmlFormElement: HTMLFormElement): void {
    closeDrawer()
    setRoleSelectionne('')
    // eslint-disable-next-line no-restricted-syntax
    window.dsfr(dialogRef.current).modal.conceal()
    htmlFormElement.reset()
  }

  function isOrganisationDisplayed(roleSelectionne: string, rolesAvecStructure: RolesAvecStructure): boolean {
    return Object.keys(rolesAvecStructure).includes(roleSelectionne)
  }
}

type Props = Readonly<{
  labelId: string
  dialogRef: RefObject<HTMLDialogElement | null>
  rolesAvecStructure: RolesAvecStructure
  closeDrawer(): void
}>

type Erreur = Readonly<{
  content: ReactNode
  className: string
}>
