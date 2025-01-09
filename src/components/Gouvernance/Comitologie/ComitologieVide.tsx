import { ReactElement } from 'react'

export default function ComitologieVide(): ReactElement {
  return (
    <>
      <p className="fr-h6">
        Actuellement, vous n’avez pas de comité
      </p>
      <p>
        Renseignez les comités prévus et la fréquence à laquelle ils se réunissent.
      </p>
    </>
  )
}
