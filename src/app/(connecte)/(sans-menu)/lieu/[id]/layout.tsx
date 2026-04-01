import { ReactElement, ReactNode } from 'react'

import MenuCollant, { type SideMenuItem } from '@/components/AidantDetails/MenuCollant'
import styles from '@/components/AidantDetails/MenuCollant.module.css'

export default function AidantLayout({ children }: Props): ReactElement {
  return (
    <div className={`fr-container fr-py-4w ${styles.fullWidth}`}>
      <div className={styles.layout}>
        <div className={styles.menuContainer}>
          <MenuCollant contentId="lieu-content" items={items} />
        </div>
        <div className={styles.contentContainer} id="lieu-content">
          {children}
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  children: ReactNode
}>

const items: ReadonlyArray<SideMenuItem> = [
  {
    linkProps: { href: '#informations-generales' },
    text: 'Informations générales',
  },
  {
    items: [
      { linkProps: { href: '#lieu-detail-description' }, text: "Description de l'activité du lieu" },
      { linkProps: { href: '#lieu-information-pratique' }, text: 'Informations pratiques' },
    ],
    linkProps: { href: '#lieu-accueil-public' },
    text: 'Lieu accueillant du public',
  },
  {
    items: [
      { linkProps: { href: '#lieu-detail-service-accompagnement' }, text: "Services & types d'accompagnement" },
      { linkProps: { href: '#lieu-detail-service-modalite' }, text: "Modalités d'accès au service" },
      { linkProps: { href: '#lieu-detail-service-public' }, text: 'Types de publics accueillis' },
    ],
    linkProps: { href: '#services-inclusion-numerique' },
    text: "Services d'inclusion numérique",
  },
]
