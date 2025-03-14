import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUneAction from '@/components/Action/AjouterUneAction'
import MenuLateral from '@/components/Action/MenuLateral'
import Notice from '@/components/shared/Notice/Notice'
import { actionARemplir } from '@/presenters/actionPresenter'

export default function ActionAjouterController(): ReactElement {
  const date = new Date()

  try {
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w menu-border">
          <Notice />
          <AjouterUneAction
            action={actionARemplir}
            date={date}
          />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}
