import { FormEvent, PropsWithChildren, ReactElement } from 'react'

import Datepicker from '@/components/shared/Datepicker/Datepicker'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import SegmentedControl from '@/components/shared/SegmentedControl/SegmentedControl'
import TextArea from '@/components/shared/TextArea/TextArea'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'
import { ComiteViewModel } from '@/presenters/gouvernancePresenter'

export default function FormulaireComite({
  children,
  comite,
  dateAujourdhui,
  label,
  labelId,
  validerFormulaire,
}: Props): ReactElement {
  return (
    <form
      aria-label={label}
      method="dialog"
      onSubmit={validerFormulaire}
    >
      <DrawerTitle id={labelId}>
        <TitleIcon icon="calendar-event-line" />
        <br />
        {label}
      </DrawerTitle>
      <p className="fr-text--sm color-grey">
        Renseignez les comités prévus et la fréquence à laquelle ils se réunissent
      </p>
      <SegmentedControl
        name="type"
        options={comite.types}
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
        options={comite.frequences}
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
          defaultValue={comite.date}
          min={dateAujourdhui}
          name="date"
        >
          Date du prochain comité
        </Datepicker>
      </div>
      <TextArea
        defaultValue={comite.commentaire}
        maxLength={500}
        rows={9}
      >
        Description
      </TextArea>
      <input
        name="uid"
        type="hidden"
        value={comite.uid}
      />
      <div className="fr-btns-group">
        {children}
      </div>
    </form>
  )
}

type Props = PropsWithChildren<Readonly<{
  comite: ComiteViewModel
  dateAujourdhui: string
  label: string
  labelId: string
  validerFormulaire(event: FormEvent<HTMLFormElement>): void
}>>
