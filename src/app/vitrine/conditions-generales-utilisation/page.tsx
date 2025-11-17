import { Metadata } from 'next'
import { ReactElement } from 'react'

import ConditionsGeneralesUtilisation from '@/components/ConditionsGeneralesUtilisation/ConditionsGeneralesUtilisation'

export const metadata: Metadata = {
  description: 'Conditions générales d\'utilisation de la plateforme Mon inclusion numérique',
  title: 'Conditions Générales d\'Utilisation',
}

export default function ConditionsGeneralesUtilisationController(): ReactElement {
  return (
    <ConditionsGeneralesUtilisation />
  )
}
