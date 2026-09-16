import { Metadata } from 'next'
import { ReactElement } from 'react'

import ConditionsGeneralesUtilisation from '@/components/ConditionsGeneralesUtilisation/ConditionsGeneralesUtilisation'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'

export const metadata: Metadata = {
  description: "Conditions générales d'utilisation de la plateforme Mon inclusion numérique",
  title: "Conditions Générales d'Utilisation",
}

export default async function ConditionsGeneralesUtilisationController(): Promise<ReactElement> {
  // Page consultable sans session : le fil d'Ariane vers le tableau de bord n'a de sens que connecté.
  const session = await getSession()

  return (
    <>
      {session ? (
        <FilAriane
          items={[
            { href: '/tableau-de-bord', label: 'Tableau de bord' },
            { label: "Conditions générales d'utilisation" },
          ]}
        />
      ) : null}
      <ConditionsGeneralesUtilisation />
    </>
  )
}
