import { PropsWithChildren, ReactElement } from 'react'

import styles from './Gouvernance.module.css'

export default function SectionVide({ buttonLabel, children, id, title }: SectionVideProps): ReactElement {
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
          className="fr-btn fr-btn--icon-left fr-icon-add-line"
          type="button"
        >
          {buttonLabel}
        </button>
      </article>
    </>
  )
}

type SectionVideProps = PropsWithChildren<Readonly<{
  buttonLabel: string
  id: string
  title: string
}>>
