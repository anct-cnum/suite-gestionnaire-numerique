import { Metadata } from 'next'
import { ReactElement } from 'react'

import ConditionsGeneralesUtilisation from '@/components/ConditionsGeneralesUtilisation/ConditionsGeneralesUtilisation'

export const metadata: Metadata = {
  description: 'Conditions générales d\'utilisation de la plateforme Inclusion Numérique. Règles d\'utilisation du service et responsabilités.',
  robots: {
    follow: false,
    index: false,
  },
  title: 'Conditions générales d\'utilisation - Inclusion Numérique',
}

export default function ConditionsGeneralesUtilisationController(): ReactElement {
  return (
    <ConditionsGeneralesUtilisation />
  )
}
