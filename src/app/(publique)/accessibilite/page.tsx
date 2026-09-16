import { Metadata } from 'next'
import { ReactElement } from 'react'

import Accessibilite from '@/components/Accessibilite/Accessibilite'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'

export const metadata: Metadata = {
  description: "Déclaration d'accessibilité de la plateforme Mon inclusion numérique",
  title: "Déclaration d'accessibilité",
}

export default async function AccessibiliteController(): Promise<ReactElement> {
  // Page consultable sans session : le fil d'Ariane vers le tableau de bord n'a de sens que connecté.
  const session = await getSession()

  return (
    <>
      {session ? (
        <FilAriane
          items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: "Déclaration d'accessibilité" }]}
        />
      ) : null}
      <Accessibilite />
    </>
  )
}
