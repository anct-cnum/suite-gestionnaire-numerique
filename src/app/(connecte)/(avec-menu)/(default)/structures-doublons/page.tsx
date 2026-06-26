import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import StructuresDoublons from '@/components/StructuresDoublons/StructuresDoublons'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructuresDoublonsLoader } from '@/gateways/PrismaStructuresDoublonsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { structuresDoublonsPresenter } from '@/presenters/structuresDoublonsPresenter'
import { RechercherStructuresDoublons } from '@/use-cases/queries/RechercherStructuresDoublons'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Doublons de structures',
}

export default async function StructuresDoublonsController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
    redirect('/tableau-de-bord')
  }

  const readModel = await new RechercherStructuresDoublons(new PrismaStructuresDoublonsLoader()).handle({ signaux: [] })
  const viewModel = structuresDoublonsPresenter(readModel)

  return (
    <>
      <FilAriane
        items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Doublons de structures' }]}
      />
      <StructuresDoublons viewModel={viewModel} />
    </>
  )
}
