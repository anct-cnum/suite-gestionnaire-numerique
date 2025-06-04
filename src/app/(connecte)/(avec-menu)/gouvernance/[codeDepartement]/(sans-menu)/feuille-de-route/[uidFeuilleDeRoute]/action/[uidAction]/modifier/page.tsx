import { notFound , redirect } from 'next/navigation'
import { ReactElement } from 'react'

import MenuLateral from '@/components/Action/MenuLateral'
import ModifierUneAction from '@/components/Action/ModifierUneAction'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaEnveloppesLoader } from '@/gateways/PrismaEnveloppesLoader'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaRepartitionSubventionGouvernanceLoader } from '@/gateways/PrismaRepartitionSubventionGouvernanceLoader'
import { PrismaUneActionLoader } from '@/gateways/PrismaUneActionLoader'
import { actionPresenter } from '@/presenters/actionPresenter'
import { enveloppePresenter } from '@/presenters/enveloppePresenter'
import { feuilleDeRouteUrl, gestionMembresGouvernanceUrl } from '@/shared/urlHelpers'

export default async function ActionModifierController({ params }: Props): Promise<ReactElement> {
  try {
    const { codeDepartement, uidAction, uidFeuilleDeRoute } = await params
    const session = await getSession()
    const date = new Date()

    if (!session) {
      redirect('/connexion')
    }
    const feuilleDeRoute = await new PrismaFeuilleDeRouteRepository().get(uidFeuilleDeRoute)

    if (feuilleDeRoute.state.uidGouvernance !== codeDepartement) {
      notFound()
    }

    const actionReadModel = await new PrismaUneActionLoader(
    ).get(uidAction)
    const enveloppesDisponibles = await new PrismaEnveloppesLoader().get(feuilleDeRoute.state.uidGouvernance)
    const urlFeuilleDeRoute = feuilleDeRouteUrl(feuilleDeRoute.state.uidGouvernance, uidFeuilleDeRoute)
    const urlGestionMembresGouvernance = gestionMembresGouvernanceUrl(feuilleDeRoute.state.uidGouvernance)
    const repartitionSubventionGouvernance = await new PrismaRepartitionSubventionGouvernanceLoader()
      .get(feuilleDeRoute.state.uidGouvernance)
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w">
          <ModifierUneAction
            action={actionPresenter(actionReadModel, {
              enveloppes: enveloppesDisponibles.enveloppes.map(enveloppe =>
                enveloppePresenter(new Date(), enveloppe, repartitionSubventionGouvernance.get(String(enveloppe.id)))),
              nomFeuilleDeRoute: actionReadModel.nomFeuilleDeRoute,
              urlFeuilleDeRoute,
              urlGestionMembresGouvernance,
            })}
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
    uidAction: string
    uidFeuilleDeRoute: string
  }>>
}>
