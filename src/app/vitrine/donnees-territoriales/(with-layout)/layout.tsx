import { ReactElement, ReactNode } from 'react'

import styles from './layout.module.css'
import { Header, Navigation } from '@/components/vitrine/DonneesTerritoriales'

export default function DonneesTerritoriales({ children }: Props): ReactElement {
  return (
    <>
      <Header titre="Données de l'inclusion numérique" />

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <Navigation />
        </aside>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  )
}

type Props = Readonly<{
  children: ReactNode
}>
