import { Metadata } from 'next'
import { ReactElement } from 'react'

import MentionsLegales from '@/components/MentionsLegales/MentionsLegales'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'

export const metadata: Metadata = {
  description: 'Informations légales de la plateforme Mon inclusion numérique',
  title: 'Mentions Légales',
}

export default async function MentionsLegalesController(): Promise<ReactElement> {
  // Page consultable sans session : le fil d'Ariane vers le tableau de bord n'a de sens que connecté.
  const session = await getSession()

  return (
    <>
      {session ? (
        <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Mentions légales' }]} />
      ) : null}
      <MentionsLegales />
    </>
  )
}
