import { ReactElement } from 'react'

import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export default function ResumeNotePriveeVide({ id, showDrawer }: Props): ReactElement {
  return (
    <>
      <div>
        <TitleIcon icon="ball-pen-line" />
      </div>
      <p className="fr-h6 color-blue-france">
        Créez une note privée
      </p>
      <p>
        Elle sera uniquement accessible par vous et votre équipe interne.
      </p>
      <button
        aria-controls={id}
        className="fr-btn fr-btn--secondary"
        data-fr-opened="false"
        onClick={showDrawer}
        type="button"
      >
        Rédiger une note
      </button>
    </>
  )
}

type Props = Readonly<{
  id: string
  showDrawer(): void
}>
