import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import MenuLateral from '@/components/Gouvernance/Actions/MenuLateral'
import ModifierUneAction from '@/components/Gouvernance/Actions/ModifierUneAction'
import { PrismaLesFeuillesDeRouteLoader } from '@/gateways/PrismaLesFeuillesDeRouteLoader'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { RecupererLesFeuillesDeRoute } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export default async function ActionModifierController({ params }: Props): Promise<ReactElement> {
  try {
    const codeDepartement = (await params).codeDepartement
    const feuillesDeRouteReadModel = await
    new RecupererLesFeuillesDeRoute(
      new PrismaLesFeuillesDeRouteLoader()
    ).handle({ codeDepartement })
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(feuillesDeRouteReadModel)
    const action = feuillesDeRouteViewModel.feuillesDeRoute[0].actions[0]
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w menu-border">
          <ModifierUneAction action={action} />
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
  }>>
}>
