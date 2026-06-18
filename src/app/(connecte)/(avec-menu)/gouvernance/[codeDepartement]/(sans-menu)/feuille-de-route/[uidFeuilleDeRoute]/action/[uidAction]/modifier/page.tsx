import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import styles from '@/components/Action/Action.module.css'
import MenuLateral from '@/components/Action/MenuLateral'
import ModifierUneAction from '@/components/Action/ModifierUneAction'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaEnveloppesLoader } from '@/gateways/PrismaEnveloppesLoader'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaRepartitionSubventionGouvernanceLoader } from '@/gateways/PrismaRepartitionSubventionGouvernanceLoader'
import { PrismaUneActionLoader } from '@/gateways/PrismaUneActionLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { actionPresenter } from '@/presenters/actionPresenter'
import { enveloppePresenter } from '@/presenters/enveloppePresenter'
import { feuilleDeRouteUrl, gestionMembresGouvernanceUrl, nomDepartement } from '@/shared/urlHelpers'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export default async function ActionModifierController({ params }: Props): Promise<ReactElement> {
  try {
    const { codeDepartement, uidAction, uidFeuilleDeRoute } = await params
    const session = await getSession()
    const date = new Date()

    if (!session) {
      redirect('/connexion')
    }

    const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    if (!contexte.peutGererGouvernance(codeDepartement)) {
      notFound()
    }

    const feuilleDeRoute = await new PrismaFeuilleDeRouteRepository().get(uidFeuilleDeRoute)

    if (feuilleDeRoute.state.uidGouvernance !== codeDepartement) {
      notFound()
    }

    const actionReadModel = await new PrismaUneActionLoader().get(uidAction)
    const enveloppesDisponibles = await new PrismaEnveloppesLoader().get(feuilleDeRoute.state.uidGouvernance)
    const urlFeuilleDeRoute = feuilleDeRouteUrl(feuilleDeRoute.state.uidGouvernance, uidFeuilleDeRoute)
    const urlGestionMembresGouvernance = gestionMembresGouvernanceUrl(feuilleDeRoute.state.uidGouvernance)
    const repartitionSubventionGouvernance = await new PrismaRepartitionSubventionGouvernanceLoader().get(
      feuilleDeRoute.state.uidGouvernance
    )
    return (
      <>
        <FilAriane
          items={[
            { href: '/tableau-de-bord', label: 'Tableau de bord' },
            { href: '/gouvernances', label: 'Gouvernances' },
            { href: `/gouvernance/${codeDepartement}`, label: nomDepartement(codeDepartement) },
            { href: urlFeuilleDeRoute, label: actionReadModel.nomFeuilleDeRoute },
            { label: 'Modifier une action' },
          ]}
        />
        <div className={styles.layout}>
          <div className={styles.menuContainer}>
            <MenuLateral />
          </div>
          <div className={`fr-pl-7w ${styles.contentContainer} ${styles['conteneur-formulaire']}`}>
            <ModifierUneAction
              action={actionPresenter(actionReadModel, {
                enveloppes: enveloppesDisponibles.enveloppes.map((enveloppe) =>
                  enveloppePresenter(new Date(), enveloppe, repartitionSubventionGouvernance.get(String(enveloppe.id)))
                ),
                nomFeuilleDeRoute: actionReadModel.nomFeuilleDeRoute,
                urlFeuilleDeRoute,
                urlGestionMembresGouvernance,
              })}
              date={date}
              uidFeuilleDeRoute={uidFeuilleDeRoute}
            />
          </div>
        </div>
      </>
    )
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      codeDepartement: string
      uidAction: string
      uidFeuilleDeRoute: string
    }>
  >
}>
