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
        {/* Grille DSFR (#2246) : la colonne de contenu a une largeur bornée et ne peut plus
            pousser la page au-delà de l'écran quand un élément refuse de passer à la ligne. */}
        <div className="fr-grid-row">
          <aside className={`fr-col-12 fr-col-lg-3 ${styles.sidebar}`}>
            <Navigation />
          </aside>

          <div className={`fr-col-12 fr-col-lg-9 ${styles.content}`}>{children}</div>
        </div>
      </div>
    </>
  )
}

type Props = Readonly<{
  children: ReactNode
}>
