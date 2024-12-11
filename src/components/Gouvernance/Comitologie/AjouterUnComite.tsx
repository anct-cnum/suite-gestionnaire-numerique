import { FormEvent, ReactElement, RefObject, useContext, useState } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
import Datepicker from '@/components/shared/Datepicker/Datepicker'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import { Notification } from '@/components/shared/Notification/Notification'
import SegmentedControl from '@/components/shared/SegmentedControl/SegmentedControl'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'
import TextArea from '@/components/shared/TextArea/TextArea'
import { formatForInputDate } from '@/presenters/shared/date'

export default function AjouterUnComite({
  dialogRef,
  uidGouvernance,
  labelId,
  setIsOpen,
}: AjouterUnComiteProps): ReactElement {
  const { ajouterUnComiteAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <form
      aria-label="Ajouter un comité"
      method="dialog"
      onSubmit={creerUnComite}
    >
      <DrawerTitle id={labelId}>
        Ajouter un comité
      </DrawerTitle>
      <p className="fr-text--sm color-grey">
        Renseignez les comités prévus et la fréquence à laquelle ils se réunissent
      </p>
      <SegmentedControl
        name="type"
        options={types}
      >
        <p className="fr-label fr-mb-0">
          Quel type de comité allez-vous organiser ?
          {' '}
          <span className="color-red">
            *
          </span>
        </p>
      </SegmentedControl>
      <SegmentedControl
        name="frequence"
        options={frequences}
      >
        <p className="fr-label fr-mb-0">
          À quelle fréquence se réunit le comité ?
          {' '}
          <span className="color-red">
            *
          </span>
        </p>
      </SegmentedControl>
      <div className="fr-col-6 fr-mb-3w">
        <Datepicker
          id="dateProchainComite"
          min={formatForInputDate(new Date())}
          name="dateProchainComite"
        >
          Date du prochain comité
        </Datepicker>
      </div>
      <TextArea
        id="commentaire"
        maxLength={500}
      >
        Laissez ici un commentaire général sur le comité
      </TextArea>
      <div className="fr-btns-group">
        <SubmitButton
          isDisabled={isDisabled}
          label={isDisabled ? 'Ajout en cours...' : 'Enregistrer'}
        />
      </div>
    </form>
  )

  async function creerUnComite(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [type, frequence, date, commentaire] = [...form.values()].map((value) => value as string)
    setIsDisabled(true)
    const messages = await ajouterUnComiteAction({ commentaire, date, frequence, path: pathname, type, uidGouvernance })
    if (messages.includes('OK')) {
      Notification('success', { description: 'bien ajouté', title: 'Comité ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    // Stryker disable next-line BooleanLiteral
    setIsOpen(false)
    window.dsfr(dialogRef.current).modal.conceal();
    (event.target as HTMLFormElement).reset()
    setIsDisabled(false)
  }
}

const types = [
  {
    id: 'strategique',
    isChecked: true,
    label: 'Stratégique',
  },
  {
    id: 'technique',
    isChecked: false,
    label: 'Technique',
  },
  {
    id: 'consultatif',
    isChecked: false,
    label: 'Consultatif',
  },
  {
    id: 'autre',
    isChecked: false,
    label: 'Autre',
  },
]

const frequences = [
  {
    id: 'mensuelle',
    isChecked: true,
    label: 'Mensuelle',
  },
  {
    id: 'trimestrielle',
    isChecked: false,
    label: 'Trimestrielle',
  },
  {
    id: 'semestrielle',
    isChecked: false,
    label: 'Semestrielle',
  },
  {
    id: 'annuelle',
    isChecked: false,
    label: 'Annuelle',
  },
]

type AjouterUnComiteProps = Readonly<{
  dialogRef: RefObject<HTMLDialogElement | null>
  uidGouvernance: string
  labelId: string
  setIsOpen(isOpen: boolean): void
}>
