import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import GestionMembres from '@/components/GestionMembresGouvernance/GestionMembres'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
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

export default async function MembresController({ params, searchParams }: Props): Promise<ReactElement> {
  const { codeDepartement } = await params
  const { role, typologie } = await searchParams

  if (!codeDepartement) {
    notFound()
  }

  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const peutGererGouvernance = contexte.peutGererGouvernance(codeDepartement)

  const membresReadModel = await new RecupererMesMembres(new PrismaMesMembresLoader()).handle({
    codeDepartement,
    role,
    typologie,
  })

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: '/gouvernances', label: 'Gouvernances' },
          { href: `/gouvernance/${codeDepartement}`, label: nomDepartement(codeDepartement) },
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
  searchParams: Promise<
    Readonly<{
      role?: string
      typologie?: string
    }>
  >
}>
