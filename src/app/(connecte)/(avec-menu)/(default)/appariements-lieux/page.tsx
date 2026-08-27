import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import AppariementsLieux from '@/components/AppariementsLieux/AppariementsLieux'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaAppariementsLieuxLoader } from '@/gateways/PrismaAppariementsLieuxLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { appariementsLieuxPresenter } from '@/presenters/appariementsLieuxPresenter'
import config from '@/use-cases/config.json'
import { RechercherAppariementsLieux, statutsAppariement } from '@/use-cases/queries/RechercherAppariementsLieux'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Appariements de lieux',
}

export default async function AppariementsLieuxController({ searchParams }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  // Revue réservée aux administrateurs (ANCT).
  if (!contexte.aCesRoles('administrateur_dispositif')) {
    redirect('/tableau-de-bord')
  }

  const { page, statut } = await searchParams
  const statutEffectif = statutsAppariement.find((candidat) => candidat === statut) ?? 'a_valider'

  const readModel = await new RechercherAppariementsLieux(new PrismaAppariementsLieuxLoader()).handle({
    pagination: {
      limite: config.utilisateursParPage,
      page: Math.max(Number(page ?? '1') - 1, 0),
    },
    statut: statutEffectif,
  })
  const viewModel = appariementsLieuxPresenter(readModel, statutEffectif)

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Appariements de lieux' }]} />
      <AppariementsLieux viewModel={viewModel} />
    </>
  )
}

type Props = Readonly<{
  searchParams: Promise<
    Readonly<{
      page?: string
      statut?: string
    }>
  >
}>
