import { PropsWithChildren, ReactElement } from 'react'

import MenuLateral from '@/components/transverse/MenuLateral/MenuLateral'

export default function Layout({ children }: Readonly<PropsWithChildren>): ReactElement {
  return (
    <div className="fr-grid-row">
      <div className="fr-col-2">
        <MenuLateral />
      </div>
      <div className="fr-col-10 fr-pl-7w menu-border">
        {children}
      </div>
    </div>
  )
}
