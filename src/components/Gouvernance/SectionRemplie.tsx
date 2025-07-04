import { PropsWithChildren, ReactElement } from 'react'

import styles from './Gouvernance.module.css'

export default function SectionRemplie({
  button,
  children,
  id,
  subButton,
  subTitle,
  title,
}: Props): ReactElement {
  return (
    <>
      <header className={`fr-grid-row fr-btns-group--space-between fr-mb-2w ${styles.header}`}>
        <div>
          <h2
            className="color-blue-france fr-mb-0"
            id={id}
          >
            {title}
          </h2>
          {subTitle}
        </div>
        <div>
          {button}
          {subButton}
        </div>
      </header>
      <article className={`background-blue-france fr-p-2w fr-mb-4w ${styles.article}`}>
        {children}
      </article>
    </>
  )
}

type Props = PropsWithChildren<Readonly<{
  button?: ReactElement
  id: string
  subButton?: ReactElement
  subTitle?: ReactElement
  title: string
}>>
