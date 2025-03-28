import { ReactElement } from 'react'

export default function ResumeNotePrivee({ edition, id, showDrawer, texte }: Props): ReactElement {
  return (
    <button
      aria-controls={id}
      aria-label="Modifier la note"
      data-fr-opened="false"
      onClick={showDrawer}
      type="button"
    >
      <p>
        <span className="color-blue-france">
          Note privée (interne)
        </span>
        <br />
        {texte}
      </p>
      <p className="fr-text--xs">
        {edition}
      </p>
    </button>
  )
}

type Props = Readonly<{
  edition: string
  id: string
  showDrawer(): void
  texte: string
}>
