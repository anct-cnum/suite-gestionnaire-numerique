import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import MembresAConsolider from '@/components/MembresAConsolider/MembresAConsolider'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaMembresAConsoliderLoader } from '@/gateways/PrismaMembresAConsoliderLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { membresAConsoliderPresenter, reglesPresenter } from '@/presenters/membresAConsoliderPresenter'
import {
  RechercherMembresAConsolider,
  RegleConsolidation,
  REGLES_CONSOLIDATION,
} from '@/use-cases/queries/RechercherMembresAConsolider'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Membres à consolider',
}

export default async function MembresAConsoliderController({ searchParams }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
    redirect('/tableau-de-bord')
  }

  const { regle: regleParam } = await searchParams
  const regle = estRegleValide(regleParam) ? regleParam : 'structure-fantome'

  const readModel = await new RechercherMembresAConsolider(new PrismaMembresAConsoliderLoader()).handle({ regle })
  const viewModel = membresAConsoliderPresenter(readModel)
  const regles = reglesPresenter(regle)

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Membres à consolider' }]} />
      <MembresAConsolider regles={regles} viewModel={viewModel} />
    </>
  )
}

function estRegleValide(valeur: string | undefined): valeur is RegleConsolidation {
  return valeur !== undefined && (REGLES_CONSOLIDATION as ReadonlyArray<string>).includes(valeur)
}

type Props = Readonly<{
  searchParams: Promise<Readonly<{ regle?: string }>>
}>
