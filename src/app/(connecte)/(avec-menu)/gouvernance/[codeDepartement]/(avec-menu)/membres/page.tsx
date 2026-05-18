import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import GestionMembres from '@/components/GestionMembresGouvernance/GestionMembres'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaMesMembresLoader } from '@/gateways/PrismaMesMembresLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { membresPresenter } from '@/presenters/membresPresenter'
import { nomDepartement } from '@/shared/urlHelpers'
import { RecupererMesMembres } from '@/use-cases/queries/RecupererMesMembres'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Membres',
}

export default async function MembresController({ params }: Props): Promise<ReactElement> {
  const { codeDepartement } = await params

  if (!codeDepartement) {
    notFound()
  }

  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const peutGererGouvernance = contexte.peutGererGouvernance(codeDepartement)

  const membresReadModel = await new RecupererMesMembres(new PrismaMesMembresLoader()).handle({ codeDepartement })

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: `/gouvernance/${codeDepartement}`, label: `Gouvernance ${nomDepartement(codeDepartement)}` },
          { label: 'Membres' },
        ]}
      />
      <GestionMembres
        membresViewModel={membresPresenter(membresReadModel)}
        peutGererGouvernance={peutGererGouvernance}
      />
    </>
  )
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      codeDepartement: string
    }>
  >
}>
