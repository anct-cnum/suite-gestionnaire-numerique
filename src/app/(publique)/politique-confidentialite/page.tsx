import { Metadata } from 'next'
import { ReactElement } from 'react'

import PolitiqueConfidentialite from '@/components/PolitiqueConfidentialite/PolitiqueConfidentialite'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'

export const metadata: Metadata = {
  description: 'Politique de confidentialité de la plateforme Mon inclusion numérique',
  title: 'Politique de confidentialité',
}

export default async function PolitiqueConfidentialiteController(): Promise<ReactElement> {
  // Page consultable sans session : le fil d'Ariane vers le tableau de bord n'a de sens que connecté.
  const session = await getSession()

  return (
    <>
      {session ? (
        <FilAriane
          items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Politique de confidentialité' }]}
        />
      ) : null}
      <PolitiqueConfidentialite />
    </>
  )
}
