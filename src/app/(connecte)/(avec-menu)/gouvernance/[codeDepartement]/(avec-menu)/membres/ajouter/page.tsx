import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUnMembrePage from '@/components/GestionMembresGouvernance/AjouterUnMembrePage'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { nomDepartement } from '@/shared/urlHelpers'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Ajouter un membre - Gouvernance',
}

export default async function Page({ params }: Props): Promise<ReactElement> {
  const codeDepartement = (await params).codeDepartement

  if (!codeDepartement) {
    notFound()
  }

  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.peutGererGouvernance(codeDepartement)) {
    notFound()
  }

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: `/gouvernance/${codeDepartement}`, label: `Gouvernance ${nomDepartement(codeDepartement)}` },
          { href: `/gouvernance/${codeDepartement}/membres`, label: 'Membres' },
          { label: 'Ajouter un membre' },
        ]}
      />
      <AjouterUnMembrePage codeDepartement={codeDepartement} />
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
