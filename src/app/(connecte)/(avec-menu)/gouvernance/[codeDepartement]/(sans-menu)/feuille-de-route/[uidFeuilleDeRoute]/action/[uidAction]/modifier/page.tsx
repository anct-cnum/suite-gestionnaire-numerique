import { notFound , redirect } from 'next/navigation'
import { ReactElement } from 'react'

import MenuLateral from '@/components/Action/MenuLateral'
import ModifierUneAction from '@/components/Action/ModifierUneAction'
import Notice from '@/components/shared/Notice/Notice'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaEnveloppesLoader } from '@/gateways/PrismaEnveloppesLoader'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaUneActionLoader } from '@/gateways/PrismaUneActionLoader'
import { actionPresenter } from '@/presenters/actionPresenter'
import { enveloppePresenter } from '@/presenters/enveloppePresenter'
import { feuilleDeRouteUrl, gestionMembresGouvernanceUrl } from '@/shared/urlHelpers'

export default async function ActionModifierController({ params }: Props): Promise<ReactElement> {
  try {
    const { uidAction, uidFeuilleDeRoute } = await params
    const session = await getSession()

    if (!session) {
      redirect('/connexion')
    }
    const actionReadModel = await new PrismaUneActionLoader(
    ).get(uidAction)
    const feuilleDeRoute = await new PrismaFeuilleDeRouteRepository().get(uidFeuilleDeRoute)
    const enveloppesDisponibles = await new PrismaEnveloppesLoader().get(feuilleDeRoute.state.uidGouvernance)
    const urlFeuilleDeRoute = feuilleDeRouteUrl(feuilleDeRoute.state.uidGouvernance, uidFeuilleDeRoute)
    const urlGestionMembresGouvernance = gestionMembresGouvernanceUrl(feuilleDeRoute.state.uidGouvernance)
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w">
          <Notice />
          <ModifierUneAction
            action={actionPresenter(actionReadModel, {
              enveloppes: enveloppesDisponibles.enveloppes.map(enveloppe => enveloppePresenter(new Date(), enveloppe)),
              nomFeuilleDeRoute: actionReadModel.nomFeuilleDeRoute,
              urlFeuilleDeRoute,
              urlGestionMembresGouvernance,
            })}
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
