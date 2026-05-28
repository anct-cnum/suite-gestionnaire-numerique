import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import styles from '@/components/Action/Action.module.css'
import AjouterUneAction from '@/components/Action/AjouterUneAction'
import MenuLateral from '@/components/Action/MenuLateral'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaEnveloppesLoader } from '@/gateways/PrismaEnveloppesLoader'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaRepartitionSubventionGouvernanceLoader } from '@/gateways/PrismaRepartitionSubventionGouvernanceLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { actionARemplir } from '@/presenters/actionPresenter'
import { enveloppePresenter } from '@/presenters/enveloppePresenter'
import { feuilleDeRouteUrl, gestionMembresGouvernanceUrl, nomDepartement } from '@/shared/urlHelpers'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export default async function ActionAjouterController({ params }: Props): Promise<ReactElement> {
  const { codeDepartement, uidFeuilleDeRoute } = await params
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

  const nomFeuilleDeRoute = feuilleDeRoute.state.nom
  const urlFeuilleDeRoute = feuilleDeRouteUrl(feuilleDeRoute.state.uidGouvernance, uidFeuilleDeRoute)
  const urlGestionMembresGouvernance = gestionMembresGouvernanceUrl(feuilleDeRoute.state.uidGouvernance)
  const enveloppesDisponibles = await new PrismaEnveloppesLoader().get(feuilleDeRoute.state.uidGouvernance)
  const repartitionSubventionGouvernance = await new PrismaRepartitionSubventionGouvernanceLoader().get(
    feuilleDeRoute.state.uidGouvernance
  )

  try {
    return (
      <>
        <FilAriane
          items={[
            { href: '/tableau-de-bord', label: 'Tableau de bord' },
            { href: `/gouvernance/${codeDepartement}`, label: `Gouvernance ${nomDepartement(codeDepartement)}` },
            { href: urlFeuilleDeRoute, label: nomFeuilleDeRoute },
            { label: 'Ajouter une action' },
          ]}
        />
        <div className="fr-grid-row">
          <div className="fr-col-2">
            <MenuLateral />
          </div>
          <div className={`fr-col-10 fr-pl-7w ${styles['conteneur-formulaire']}`}>
            <AjouterUneAction
              action={actionARemplir(undefined, {
                enveloppes: enveloppesDisponibles.enveloppes.map((enveloppe) =>
                  enveloppePresenter(date, enveloppe, repartitionSubventionGouvernance.get(String(enveloppe.id)))
                ),
                nomFeuilleDeRoute,
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
      uidFeuilleDeRoute: string
    }>
  >
}>
