import { PropsWithChildren, ReactElement } from 'react'

import LayoutConnecte from '@/app/(connecte)/layout'
import Dsfr from '@/app/Dsfr'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'

// Pages légales (accessibilité, mentions légales, CGU, confidentialité) : elles sont liées depuis le pied de page,
// y compris avant connexion, et doivent donc rester consultables sans session. Connecté, on garde l'habillage
// habituel (en-tête, menu compte) ; sinon, un habillage minimal avec le même pied de page.
export default async function Layout({ children }: Readonly<PropsWithChildren>): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    return (
      <>
        <LienEvitement />
        <main className="fr-container--fluid fr-mx-5w" id="content">
          {children}
        </main>
        <PiedDePage />
        <Dsfr />
      </>
    )
  }

  return (
    <LayoutConnecte>
      {children}
      <Dsfr />
    </LayoutConnecte>
  )
}
