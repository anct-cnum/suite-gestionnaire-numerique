'use client'

import { FormEvent, ReactElement, useId, useState } from 'react'

import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import TextInput from '../shared/TextInput/TextInput'
import { emailPattern, telephonePattern } from '@/shared/patterns'

export default function FormulaireContactStructure({
  contactReferent,
  labelId,
  onSubmit,
  titre,
}: Props): ReactElement {
  const [isDisabled, setIsDisabled] = useState(false)
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const telephoneId = useId()
  const fonctionId = useId()
  const referentFNEId = useId()

  return (
    <>
      <DrawerTitle id={labelId}>
        {titre}
      </DrawerTitle>
      <p className="fr-text--sm color-grey fr-mt-0">
        Responsable ou contact technique de votre structure.
        <br />
        Les champs avec
        {' '}
        <span className="color-red">
          *
        </span>
        {' '}
        sont obligatoires.
      </p>
      <div
        className="fr-mb-3w"
        style={{
          alignItems: 'center',
          backgroundColor: 'var(--background-contrast-info)',
          borderRadius: '8px',
          display: 'flex',
          gap: '16px',
          padding: '16px 24px',
        }}
      >
        <span
          aria-hidden="true"
          className="fr-icon-info-fill"
          style={{ color: 'var(--background-flat-info)', flexShrink: 0 }}
        />
        <p className="fr-mb-0">
          Si vous souhaitez ajouter des utilisateurs pour accéder à votre espace Mon Inclusion Numérique cliquez sur
          {' '}
          <a
            className="fr-link"
            href="/mes-utilisateurs"
          >
            Gérer mon équipe
          </a>
        </p>
      </div>
      <form
        aria-label={titre}
        method="dialog"
        onSubmit={submitContact}
      >
        <TextInput
          defaultValue={contactReferent?.nom}
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
          defaultValue={contactReferent?.prenom}
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
          defaultValue={contactReferent?.email}
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
          defaultValue={contactReferent?.telephone}
          id={telephoneId}
          name="telephone"
          pattern={telephonePattern.source}
          required={false}
          type="tel"
        >
          Téléphone
        </TextInput>
        <TextInput
          defaultValue={contactReferent?.fonction}
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
        <div className="fr-fieldset__element fr-mb-3w">
          <div className="fr-checkbox-group">
            <input
              defaultChecked={contactReferent?.estReferentFNE}
              id={referentFNEId}
              name="estReferentFNE"
              type="checkbox"
            />
            <label
              className="fr-label"
              htmlFor={referentFNEId}
            >
              Contact référent FNE
            </label>
          </div>
        </div>
        <div className="fr-btns-group">
          <SubmitButton isDisabled={isDisabled}>
            {isDisabled ? 'Enregistrement en cours...' : 'Enregistrer'}
          </SubmitButton>
        </div>
      </form>
    </>
  )

  async function submitContact(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    setIsDisabled(true)

    await onSubmit({
      email: form.get('email') as string,
      estReferentFNE: form.get('estReferentFNE') === 'on',
      fonction: form.get('fonction') as string,
      nom: form.get('nom') as string,
      prenom: form.get('prenom') as string,
      telephone: form.get('telephone') as string,
    })

    setIsDisabled(false)
  }
}

type ContactFormData = Readonly<{
  email: string
  estReferentFNE: boolean
  fonction: string
  nom: string
  prenom: string
  telephone: string
}>

export type { ContactFormData }

type Props = Readonly<{
  contactReferent?: ContactFormData
  labelId: string
  onSubmit(data: ContactFormData): Promise<void>
  titre: string
}>
