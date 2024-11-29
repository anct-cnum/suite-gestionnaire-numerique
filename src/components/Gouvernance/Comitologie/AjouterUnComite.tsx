import { FormEvent, ReactElement, useState } from 'react'

import SegmentedControl from '../../shared/SegmentedControl/SegmentedControl'
import TextArea from '../../shared/TextArea/TextArea'
import TextInput from '../../shared/TextInput/TextInput'

const types = [
  {
    id: 'strategique',
    label: 'Stratégique',
  },
  {
    id: 'technique',
    label: 'Technique',
  },
  {
    id: 'consultatif',
    label: 'Consultatif',
  },
  {
    id: 'autre',
    label: 'Autre',
  },
]

const frequences = [
  {
    id: 'mensuelle',
    label: 'Mensuelle',
  },
  {
    id: 'trimestrielle',
    label: 'Trimestrielle',
  },
  {
    id: 'semestrielle',
    label: 'Semestrielle',
  },
  {
    id: 'annuelle',
    label: 'Annuelle',
  },
]

export default function AjouterUnComite(): ReactElement {
  const [isSendDisabled, setIsSendDisabled] = useState(true)
  const dateDuJour = new Date().toISOString().slice(0, 10)

  return (
    <form
      aria-label="Ajouter un comité"
      method="dialog"
      onInput={checkValidity}
      onSubmit={creerUnComite}
    >
      <h1 className="color-blue-france fr-mt-5w">
        <div
          aria-hidden="true"
          className="fr-icon-calendar-event-line icon-title w-fit-content fr-mb-1w"
        />
        Ajouter un comité
      </h1>
      <p className="fr-text--sm color-grey">
        Renseignez les comités prévus et la fréquence à laquelle ils se réunissent
      </p>
      <p className="fr-mb-1w">
        Quel type de comité allez-vous organiser ?
        {' '}
        <span className="color-red">
          *
        </span>
      </p>
      <SegmentedControl options={types} />
      <p className="fr-mb-1w">
        A quelle fréquence se réunit le comité ?
        {' '}
        <span className="color-red">
          *
        </span>
      </p>
      <SegmentedControl options={frequences} />
      <TextInput
        id="dateProchainComite"
        min={dateDuJour}
        name="dateProchainComite"
        required={false}
        type="date"
      >
        Date du prochain comité
      </TextInput>
      <TextArea
        id="commentaire"
        maxLength={500}
      >
        Laissez ici un commentaire général sur le comité
      </TextArea>
      <button
        className="fr-btn fr-my-2w center-button"
        data-fr-opened="false"
        disabled={isSendDisabled}
        type="submit"
      >
        Enregistrer
      </button>
    </form>
  )

  function creerUnComite(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [type, frequence, date, commentaire] = [...form.values()].map((value) => value as string)
    // eslint-disable-next-line no-console
    console.log(type, frequence, date, commentaire)
  }

  function checkValidity(event: FormEvent<HTMLFormElement>): void {
    const form = new FormData(event.currentTarget)
    const isDisabled = [...form.values()].some((value) => value === '')
    setIsSendDisabled(isDisabled)
  }
}
