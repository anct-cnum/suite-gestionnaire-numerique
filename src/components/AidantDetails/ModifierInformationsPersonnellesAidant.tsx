'use client'

import { usePathname } from 'next/navigation'
import { ReactElement, SyntheticEvent, useId, useState } from 'react'

import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { Notification } from '../shared/Notification/Notification'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import TextInput from '../shared/TextInput/TextInput'
import { modifierInformationsPersonnellesAidantAction } from '@/app/api/actions/modifierInformationsPersonnellesAidantAction'
import { telephonePattern } from '@/shared/patterns'

export default function ModifierInformationsPersonnellesAidant({
  aidantId,
  closeDrawer,
  emails,
  labelId,
  nom,
  prenom,
  telephone,
}: Props): ReactElement {
  const pathname = usePathname()
  const [isDisabled, setIsDisabled] = useState(false)
  const nomId = useId()
  const prenomId = useId()
  const emailsId = useId()
  const telephoneId = useId()

  return (
    <>
      <DrawerTitle id={labelId}>Modifier</DrawerTitle>
      <p className="fr-text--sm color-grey">
        Les champs avec <span className="color-red">*</span> sont obligatoires.
      </p>
      <form
        aria-label="Modifier les informations personnelles"
        method="dialog"
        onSubmit={(event) => {
          void submit(event)
        }}
      >
        <TextInput defaultValue={nom} id={nomId} name="nom" required={true}>
          Nom <span className="color-red">*</span>
        </TextInput>
        <TextInput defaultValue={prenom} id={prenomId} name="prenom" required={true}>
          Prénom <span className="color-red">*</span>
        </TextInput>
        <TextInput defaultValue={emails.join(', ')} id={emailsId} name="emails" required={true}>
          {'Adresse(s) électronique(s) '}
          <span className="color-red">*</span>{' '}
          <span className="fr-hint-text">
            Séparez chaque adresse par une virgule ou un point-virgule. Exemple : paul.duran@rhone.fr,
            p.duran@mediation69.fr
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
          Téléphone professionnel <span className="fr-hint-text">Formats attendus : 0122334455 ou +33122334455</span>
        </TextInput>
        <div className="fr-btns-group">
          <SubmitButton isDisabled={isDisabled}>
            {isDisabled ? 'Enregistrement en cours...' : 'Enregistrer'}
          </SubmitButton>
        </div>
      </form>
    </>
  )

  async function submit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    setIsDisabled(true)

    const messages = await modifierInformationsPersonnellesAidantAction({
      aidantId,
      emails: form.get('emails') as string,
      nom: form.get('nom') as string,
      path: pathname,
      prenom: form.get('prenom') as string,
      telephone: form.get('telephone') as string,
    })

    if (messages.includes('OK')) {
      Notification('success', {
        description: '',
        title: 'Les informations personnelles ont bien été modifiées.',
      })
      closeDrawer()
    } else {
      messages.forEach((message) => {
        Notification('error', { description: message, title: 'Erreur : ' })
      })
    }

    setIsDisabled(false)
  }
}

type Props = Readonly<{
  aidantId: number
  closeDrawer(): void
  emails: ReadonlyArray<string>
  labelId: string
  nom: string
  prenom: string
  telephone?: string
}>
