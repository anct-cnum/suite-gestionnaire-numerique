import { PropsWithChildren, ReactElement } from 'react'

import styles from './Gouvernance.module.css'

export default function SectionVide({
  buttonLabel,
  children,
  drawerComiteId,
  id,
  showDrawer,
  title,
}: Props): ReactElement {
  return (
    <>
      <header>
        <h2
          className="color-blue-france"
          id={id}
        >
          {title}
        </h2>
      </header>
      <article className={`icon-title fr-p-6w fr-mb-4w ${styles.center}`}>
        {children}
        <button
          aria-controls={drawerComiteId}
          className="fr-btn fr-btn--icon-left fr-icon-add-line"
          data-fr-opened="false"
          onClick={showDrawer}
          type="button"
        >
          {buttonLabel}
        </button>
      </article>
    </>
  )
}

type Props = PropsWithChildren<Readonly<{
  buttonLabel: string
  drawerComiteId: string
  id: string
  title: string
  showDrawer(): void
}>>
