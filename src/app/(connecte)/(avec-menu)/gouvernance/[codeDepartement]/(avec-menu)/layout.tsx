import { notFound, redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import { MenuActifProvider } from '@/components/transverse/MenuLateral/MenuActifContext'
import MenuLateral from '@/components/transverse/MenuLateral/MenuLateral'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export default async function Layout({ children }: Readonly<PropsWithChildren>): Promise<ReactElement> {
  try {
    const session = await getSession()

    if (!session) {
      redirect('/connexion')
    }

    const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())

    return (
      <div className="fr-grid-row">
        <div className="fr-col-12 fr-col-md-3 fr-col-xl-3" style={{ flexShrink: 0, minWidth: '320px' }}>
          <MenuActifProvider>
            <MenuLateral contexte={contexte} />
          </MenuActifProvider>
        </div>
        <div className="fr-col-12 fr-col-md-9 fr-col-xl-9 fr-pl-md-7w menu-border" style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    )
  } catch {
    notFound()
  }
}
