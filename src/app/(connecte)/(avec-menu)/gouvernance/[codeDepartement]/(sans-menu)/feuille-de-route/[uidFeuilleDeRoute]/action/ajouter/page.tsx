import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUneAction from '@/components/Action/AjouterUneAction'
import MenuLateral from '@/components/Action/MenuLateral'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { actionARemplir } from '@/presenters/actionPresenter'
import { feuilleDeRouteUrl , gestionMembresGouvernanceUrl } from '@/shared/urlHelpers'

export default async function ActionAjouterController({  params,
}: Props): Promise<ReactElement> {
  const { uidFeuilleDeRoute } = await params
  const date = new Date()
  const feuilleDeRoute = await new PrismaFeuilleDeRouteRepository().get(uidFeuilleDeRoute)
  const nomFeuilleDeRoute = feuilleDeRoute.state.nom
  const urlFeuilleDeRoute = feuilleDeRouteUrl(feuilleDeRoute.state.uidGouvernance, uidFeuilleDeRoute)
  const urlGestionMembresGouvernance = gestionMembresGouvernanceUrl(feuilleDeRoute.state.uidGouvernance)
  try {
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w">
          <AjouterUneAction
            action={actionARemplir(undefined, { nomFeuilleDeRoute, urlFeuilleDeRoute, urlGestionMembresGouvernance })}
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

type Props = Readonly<{
  params: Promise<Readonly<{
    uidFeuilleDeRoute: string
  }>>
}>
