import { ReactElement } from 'react'

import styles from './BarreLogosPartenaires.module.css'

const logos: ReadonlyArray<Logo> = [
  { alt: 'La Coop de la médiation numérique', src: '/vitrine/accueil/logo-coop.png' },
  { alt: 'Cartographie Nationale', src: '/vitrine/accueil/logo-carto.png' },
  { alt: 'Aidants Connect', hasBackground: true, src: '/vitrine/accueil/logo-aidants-connect.png' },
  { alt: 'Conseillers Numériques', hasBackground: true, src: '/vitrine/accueil/logo-conseillers-numeriques.png' },
  { alt: 'MedNum', src: '/vitrine/accueil/logo-mednum.png' },
  { alt: 'Data Inclusion', hasBackground: true, src: '/vitrine/accueil/logo-data-inclusion.png' },
]

export default function BarreLogosPartenaires({ className = '' }: Props): ReactElement {
  return (
    <div className={`${styles.container} ${className}`}>
      {logos.map((logo) => (
        <div
          className={logo.hasBackground === true ? styles.logoWithBackground : styles.logo}
          key={logo.src}
        >
          <img
            alt={logo.alt}
            src={logo.src}
          />
        </div>
      ))}
    </div>
  )
}

type Logo = Readonly<{
  alt: string
  hasBackground?: boolean
  src: string
}>

type Props = Readonly<{
  className?: string
}>
