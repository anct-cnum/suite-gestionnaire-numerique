import { PropsWithChildren, ReactElement } from 'react'

import styles from './Gouvernance.module.css'

export default function SectionRemplie({
  button,
  children,
  id,
  niveauTitre: Titre = 'h2',
  subButton,
  subTitle,
  title,
}: Props): ReactElement {
  return (
    <>
      <header className={`fr-grid-row fr-btns-group--space-between fr-mb-2w ${styles.header}`}>
        <div>
          {/* fr-h2 : même taille de titre quel que soit le niveau (RGAA 9.1, #2357) */}
          <Titre className="fr-h2 color-blue-france fr-mb-0" id={id}>
            {title}
          </Titre>
          {subTitle}
        </div>
        <div>
          {button}
          {subButton}
        </div>
      </header>
      <article className={`background-blue-france fr-p-2w fr-mb-4w ${styles.article}`}>{children}</article>
    </>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    button?: ReactElement
    id: string
    niveauTitre?: 'h2' | 'h3'
    subButton?: ReactElement
    subTitle?: ReactElement
    title: string
  }>
>
