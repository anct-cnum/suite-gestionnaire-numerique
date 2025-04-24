import { notFound , redirect } from 'next/navigation'
import { ReactElement } from 'react'

import MenuLateral from '@/components/Action/MenuLateral'
import ModifierUneAction from '@/components/Action/ModifierUneAction'
import Notice from '@/components/shared/Notice/Notice'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUneActionLoader } from '@/gateways/PrismaUneActionLoader'
import { actionPresenter2 } from '@/presenters/actionPresenter'

export default async function ActionModifierController({ params }: Props): Promise<ReactElement> {
  try {
    const { uidAction } = await params
    const session = await getSession()

    if (!session) {
      redirect('/connexion')
    }
    const actionReadModel = await new PrismaUneActionLoader(
    ).get(uidAction)

    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w">
          <Notice />
          <ModifierUneAction
            action={actionPresenter2(actionReadModel)}
          />
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
    uidAction: string
    uidFeuilleDeRoute: string
  }>>
}>
