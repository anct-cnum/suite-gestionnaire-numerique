import { ReactElement } from 'react'

import SegmentedControl from '../../shared/SegmentedControl/SegmentedControl'
import TextArea from '../../shared/TextArea/TextArea'
import TextInput from '../../shared/TextInput/TextInput'
import Title from '../../shared/Title/Title'

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
  return (
    <div>
      <Title icon="calendar-event-line">
        Ajouter un comité
      </Title>
      <p className="fr-text--sm color-grey">
        Renseignez les comités prévus et la fréquence à laquelle ils se réunissent
      </p>
      <p>
        Quel type de comité allez-vous organiser ?
        {' '}
        <span className="color-red">
          *
        </span>
      </p>
      <SegmentedControl
        options={types}
      />
      <p>
        A quelle fréquence se réunit le comité ?
        {' '}
        <span className="color-red">
          *
        </span>
      </p>
      <SegmentedControl
        options={frequences}
      />
      <TextInput
        id="date-prochain-comite"
        name="date-prochain-comite"
        required={true}
        type="date"
      >
        Date du prochain comité
      </TextInput>
      <TextArea id="commentaire">
        Laissez ici un commentaire général sur le comité
      </TextArea>
    </div>
  )
}
