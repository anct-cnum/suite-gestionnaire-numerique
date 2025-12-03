import { ReactElement, ReactNode } from 'react'

import styles from './layout.module.css'
import { Header, Navigation } from '@/components/vitrine/DonneesTerritoriales'

export default function DonneesTerritoriales({ children }: Props): ReactElement {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Header titre="Données de l'inclusion numérique" />
      </div>

      <aside className={styles.sidebar}>
        <Navigation />
      </aside>

      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}

type Props = Readonly<{
  children: ReactNode
}>
