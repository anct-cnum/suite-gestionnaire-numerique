import { ReactElement } from 'react'

export default function ResumeNotePrivee({ id, edition, showDrawer, texte }: Props): ReactElement {
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
  id: string
  edition: string
  texte: string
  showDrawer(): void
}>
