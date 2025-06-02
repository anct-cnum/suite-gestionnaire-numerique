import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUneAction from '@/components/Action/AjouterUneAction'
import MenuLateral from '@/components/Action/MenuLateral'
import { PrismaEnveloppesLoader } from '@/gateways/PrismaEnveloppesLoader'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaRepartitionSubventionGouvernanceLoader } from '@/gateways/PrismaRepartitionSubventionGouvernanceLoader'
import { actionARemplir } from '@/presenters/actionPresenter'
import { enveloppePresenter } from '@/presenters/enveloppePresenter'
import { feuilleDeRouteUrl , gestionMembresGouvernanceUrl } from '@/shared/urlHelpers'

export default async function ActionAjouterController({  params,
}: Props): Promise<ReactElement> {
  const { uidFeuilleDeRoute } = await params
  const date = new Date()
  const feuilleDeRoute = await new PrismaFeuilleDeRouteRepository().get(uidFeuilleDeRoute)
  const nomFeuilleDeRoute = feuilleDeRoute.state.nom
  const urlFeuilleDeRoute = feuilleDeRouteUrl(feuilleDeRoute.state.uidGouvernance, uidFeuilleDeRoute)
  const urlGestionMembresGouvernance = gestionMembresGouvernanceUrl(feuilleDeRoute.state.uidGouvernance)
  const enveloppesDisponibles = await new PrismaEnveloppesLoader().get(feuilleDeRoute.state.uidGouvernance)
  const repartitionSubventionGouvernance = await new PrismaRepartitionSubventionGouvernanceLoader()
    .get(feuilleDeRoute.state.uidGouvernance)

  try {
    return (
      <div className="fr-grid-row">
        <div className="fr-col-2">
          <MenuLateral />
        </div>
        <div className="fr-col-10 fr-pl-7w">
          <AjouterUneAction
            action={actionARemplir(undefined, 
              { enveloppes: enveloppesDisponibles.enveloppes.map(enveloppe => 
                enveloppePresenter(date, enveloppe, repartitionSubventionGouvernance.get(String(enveloppe.id)))),
              nomFeuilleDeRoute,
              urlFeuilleDeRoute,
              urlGestionMembresGouvernance })}
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
