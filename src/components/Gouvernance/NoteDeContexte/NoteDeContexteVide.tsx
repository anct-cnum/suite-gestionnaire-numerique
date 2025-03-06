import { ReactElement } from 'react'

export default function NoteDeContexteVide({ drawerNoteDeContexteId, showDrawer }: Props): ReactElement {
  return (
    <>
      <p className="fr-h6">
        Aucune note de contexte
      </p>
      <p>
        Précisez, au sein d’une note qualitative, les spécificités de votre démarche,
        les éventuelles difficultés que vous rencontrez, ou tout autre élément
        que vous souhaitez porter à notre connaissance.
      </p>
      <button
        aria-controls={drawerNoteDeContexteId}
        className="fr-btn fr-btn--icon-left fr-icon-add-line"
        data-fr-opened="false"
        onClick={showDrawer}
        type="button"
      >
        Ajouter une note de contexte
      </button>
    </>
  )
}

type Props = Readonly<{
  drawerNoteDeContexteId: string
  showDrawer(): void
}>
