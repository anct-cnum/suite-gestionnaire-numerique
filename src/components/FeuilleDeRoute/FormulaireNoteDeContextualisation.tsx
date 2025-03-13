import { FormEvent, PropsWithChildren, ReactElement } from 'react'

import TextEditor from '../shared/RichTextEditor/TextEditor'
import DrawerTitle from '@/components/shared/DrawerTitle/DrawerTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export default function FormulaireNoteDeContextualisation({
  children,
  labelId,
  contenu,
  gererLeChangementDeContenu,
  validerFormulaire,
}: Props): ReactElement {
  return (
    <form
      aria-label="Contextualisation des demandes de subvention"
      method="dialog"
      onSubmit={validerFormulaire}
    >
      <DrawerTitle id={labelId}>
        <TitleIcon icon="message-2-line" />
        <br />
        Contextualisation des demandes de subvention
      </DrawerTitle>
      <p className="fr-text--sm color-grey">
        Précisez, au sein d‘une note qualitative, les spécificités de votre démarche, les éventuelles difficultés
        que vous rencontrez, ou tout autre élément que vous souhaitez porter à notre connaissance.
      </p>
      <TextEditor
        ariaLabel="Éditeur de note de contextualisation"
        contenu={contenu}
        height={380}
        onChange={gererLeChangementDeContenu}
      />
      {children}
    </form>
  )
}

type Props = PropsWithChildren<Readonly<{
  labelId: string
  texte: string
  contenu: string
  gererLeChangementDeContenu(contenu: string): void
  validerFormulaire(event: FormEvent<HTMLFormElement>): void
}>>
