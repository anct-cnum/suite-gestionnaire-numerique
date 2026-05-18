import { Metadata } from 'next'
import { ReactElement } from 'react'

import ConditionsGeneralesUtilisation from '@/components/ConditionsGeneralesUtilisation/ConditionsGeneralesUtilisation'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'

export const metadata: Metadata = {
  description: "Conditions générales d'utilisation de la plateforme Mon inclusion numérique",
  title: "Conditions Générales d'Utilisation",
}

export default function ConditionsGeneralesUtilisationController(): ReactElement {
  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { label: "Conditions générales d'utilisation" },
        ]}
      />
      <ConditionsGeneralesUtilisation />
    </>
  )
}
