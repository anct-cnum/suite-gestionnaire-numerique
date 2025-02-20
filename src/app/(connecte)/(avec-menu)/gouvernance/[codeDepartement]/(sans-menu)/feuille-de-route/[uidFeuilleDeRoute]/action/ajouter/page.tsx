import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUneAction from '@/components/Action/AjouterUneAction'
import MenuLateral from '@/components/Action/MenuLateral'
import { PrismaLesFeuillesDeRouteLoader } from '@/gateways/PrismaLesFeuillesDeRouteLoader'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { RecupererLesFeuillesDeRoute } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export default async function ActionAjouterController({ params }: Props): Promise<ReactElement> {
  const date = new Date()
  try {
    const codeDepartement = (await params).codeDepartement
    const feuillesDeRouteReadModel = await
    new RecupererLesFeuillesDeRoute(
      new PrismaLesFeuillesDeRouteLoader()
    ).handle({ codeDepartement })
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(feuillesDeRouteReadModel)
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w menu-border">
          <AjouterUneAction
            action={feuillesDeRouteViewModel.actionARemplir}
            date={date}
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
  }>>
}>
