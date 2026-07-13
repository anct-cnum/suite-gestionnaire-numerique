import Image from 'next/image'
import { ReactElement } from 'react'

import styles from './PastilleLabelisation.module.css'

export default function PastilleLabelisation({ className = 'fr-ml-1w', labelisation }: Props): ReactElement {
  const picto = pictos[labelisation]

  return (
    <span className={`${className} ${styles.pastille}`}>
      <Image alt={picto.alt} height={24} src={`${process.env.NEXT_PUBLIC_HOST}${picto.src}`} width={24} />
    </span>
  )
}

const pictos = {
  'aidants connect': { alt: 'Aidants Connect', src: '/aidant-numerique.svg' },
  'conseiller numérique': { alt: 'Conseiller numérique', src: '/conum.svg' },
} as const

type Props = Readonly<{
  className?: string
  labelisation: 'aidants connect' | 'conseiller numérique'
}>
