import { ReactElement } from 'react'

import SectionVide from '../SectionVide'

export default function ComitologieVide(): ReactElement {
  return (
    <SectionVide
      buttonLabel="Ajouter un comité"
      id="comitologie"
      title="Comitologie"
    >
      <p className="fr-h6">
        Actuellement, vous n’avez pas de comité
      </p>
      <p>
        Renseignez les comités prévus et la fréquence à laquelle ils se réunissent.
      </p>
    </SectionVide>
  )
}
