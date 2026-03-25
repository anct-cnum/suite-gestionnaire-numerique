import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import { MenuActifProvider } from '@/components/transverse/MenuLateral/MenuActifContext'
import MenuLateral from '@/components/transverse/MenuLateral/MenuLateral'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export default async function Layout({ children }: Readonly<PropsWithChildren>): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())

  return (
    <div className="fr-grid-row">
      <div className="fr-col-2">
        <MenuActifProvider>
          <MenuLateral
            contexte={contexte}
          />
        </MenuActifProvider>
      </div>
      <div className="fr-col-10 fr-pl-7w menu-border">{children}</div>
    </div>
  )
}
