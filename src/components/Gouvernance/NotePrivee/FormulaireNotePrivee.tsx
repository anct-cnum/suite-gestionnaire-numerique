import { FormEvent, PropsWithChildren, ReactElement } from 'react'

import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import TextArea from '@/components/shared/TextArea/TextArea'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export default function FormulaireNotePrivee({
  children,
  labelId,
  texte,
  validerFormulaire,
}: Props): ReactElement {
  return (
    <form
      aria-label="Note privée"
      method="dialog"
      onSubmit={validerFormulaire}
    >
      <DrawerTitle id={labelId}>
        <TitleIcon icon="message-2-line" />
        <br />
        Note privée
      </DrawerTitle>
      <p className="fr-text--sm color-grey">
        Uniquement accessibles par vous et votre équipe interne.
      </p>
      <TextArea
        defaultValue={texte}
        maxLength={500}
      >
        Votre note
      </TextArea>
      {children}
    </form>
  )
}

type Props = PropsWithChildren<Readonly<{
  labelId: string
  texte: string
  validerFormulaire(event: FormEvent<HTMLFormElement>): void
}>>
