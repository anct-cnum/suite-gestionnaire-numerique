import { ReactElement, ReactNode } from 'react'

import styles from './layout.module.css'
import { Header, Navigation } from '@/components/vitrine/DonneesTerritoriales'

export default function DonneesTerritoriales({ children }: Props): ReactElement {
  return (
    <>
      <div className={styles.headerWrapper}>
        <div className="fr-container">
          <Header titre="Données de l'inclusion numérique" />
        </div>
      </div>

      <div className="fr-container">
        <div className={styles.wrapper}>
          <aside className={styles.sidebar}>
            <Navigation />
          </aside>

          <div className={styles.content}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

type Props = Readonly<{
  children: ReactNode
}>
