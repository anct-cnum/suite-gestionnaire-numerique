import { ReactElement } from 'react'

import SectionVide from '../SectionVide'

export default function NoteDeContexteVide(): ReactElement {
  return (
    <SectionVide
      buttonLabel="Ajouter une note de contexte"
      id="noteDeContexte"
      title="Note de contexte"
    >
      <p className="fr-h6">
        Aucune note de contexte
      </p>
      <p>
        Précisez, au sein d’une note qualitative, les spécificités de votre démarche,
        les éventuelles difficultés que vous rencontrez, ou tout autre élément
        que vous souhaitez porter à notre connaissance.
      </p>
    </SectionVide>
  )
}
