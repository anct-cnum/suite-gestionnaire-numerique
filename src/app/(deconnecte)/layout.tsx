import { PropsWithChildren, ReactElement } from 'react'

import styles from './layout.module.css'
import Dsfr from '@/app/Dsfr'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'

export default function Layout({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <div className={styles.page}>
      <main className={styles.contenu}>{children}</main>
      <PiedDePage />
      <Dsfr />
    </div>
  )
}
