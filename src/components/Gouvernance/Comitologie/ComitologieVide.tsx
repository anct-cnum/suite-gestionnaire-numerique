import { ReactElement } from 'react'

export default function ComitologieVide({ drawerComiteId, showDrawer }: Props): ReactElement {
  return (
    <>
      <p className="fr-h6">
        Actuellement, vous n’avez pas de comité
      </p>
      <p>
        Renseignez les comités prévus et la fréquence à laquelle ils se réunissent.
      </p>
      <button
        aria-controls={drawerComiteId}
        className="fr-btn fr-btn--icon-left fr-icon-add-line"
        data-fr-opened="false"
        onClick={showDrawer}
        type="button"
      >
        Ajouter un comité
      </button>
    </>
  )
}

type Props = Readonly<{
  drawerComiteId: string
  showDrawer(): void
}>
