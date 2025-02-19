import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUneAction from '@/components/Gouvernance/Actions/AjouterUneAction'
import MenuLateral from '@/components/Gouvernance/Actions/MenuLateral'

export default function AjouterActionController(): ReactElement {
  const date = new Date()
  try {
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w menu-border">
          <AjouterUneAction date={date} />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}
