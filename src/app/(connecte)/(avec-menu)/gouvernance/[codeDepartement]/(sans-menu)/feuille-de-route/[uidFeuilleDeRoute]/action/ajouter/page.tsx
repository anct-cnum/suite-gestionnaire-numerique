import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUneAction from '@/components/Action/AjouterUneAction'
import MenuLateral from '@/components/Action/MenuLateral'
import Notice from '@/components/shared/Notice/Notice'
import { actionARemplir } from '@/presenters/actionPresenter'

export default async function ActionAjouterController({  params,
}: Readonly<{
  params: { uidFeuilleDeRoute: string }
}>): Promise<ReactElement> {
  const { uidFeuilleDeRoute } = await params
  const date = new Date()

  try {
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w">
          <Notice />
          <AjouterUneAction
            action={actionARemplir(undefined)}
            date={date}
            uidFeuilleDeRoute={uidFeuilleDeRoute}
          />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}
