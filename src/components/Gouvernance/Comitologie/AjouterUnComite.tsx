import { FormEvent, ReactElement, RefObject, useContext } from 'react'

import { clientContext } from '../../shared/ClientContext'
import Datepicker from '../../shared/Datepicker/Datepicker'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import SegmentedControl from '@/components/shared/SegmentedControl/SegmentedControl'
import TextArea from '@/components/shared/TextArea/TextArea'
import { formatForInputDate } from '@/presenters/shared/date'

export default function AjouterUnComite({ dialogRef, labelId, setIsOpen }: AjouterUnComiteProps): ReactElement {
  const dateDuJour = formatForInputDate(new Date())
  const { ajouterUnComiteAction } = useContext(clientContext)

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
          min={dateDuJour}
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
      <button
        className="fr-btn fr-my-2w center-button"
        data-fr-opened="false"
        type="submit"
      >
        Enregistrer
      </button>
    </form>
  )

  async function creerUnComite(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const [type, frequence, date, commentaire] = [...form.values()].map((value) => value as string)
    await ajouterUnComiteAction({ commentaire, date, frequence, gouvernanceId: '', type })
    // Stryker disable next-line BooleanLiteral
    setIsOpen(false)
    window.dsfr(dialogRef.current).modal.conceal();
    (event.target as HTMLFormElement).reset()
  }
}

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

type AjouterUnComiteProps = Readonly<{
  dialogRef: RefObject<HTMLDialogElement | null>
  labelId: string
  setIsOpen(isOpen: boolean): void
}>
