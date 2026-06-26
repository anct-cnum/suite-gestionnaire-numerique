import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import LieuInclusionHistorique from '@/components/LieuInclusionHistorique/LieuInclusionHistorique'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaLieuHistoriqueLoader } from '@/gateways/PrismaLieuHistoriqueLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { lieuHistoriquePresenter } from '@/presenters/lieuHistoriquePresenter'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: "Historique du lieu d'inclusion",
}

async function LieuHistoriquePage({ params }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
    redirect('/tableau-de-bord')
  }

  const { id } = await params

  const loader = new PrismaLieuHistoriqueLoader()
  const readModel = await loader.recuperer(id)

  if ('type' in readModel) {
    notFound()
  }

  const viewModel = lieuHistoriquePresenter(readModel)

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: '/liste-lieux-inclusion', label: 'Suivi des lieux' },
          { href: `/lieu/${id}`, label: viewModel.nomLieu },
          { label: 'Historique' },
        ]}
      />
      <LieuInclusionHistorique lieuId={id} viewModel={viewModel} />
    </>
  )
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      id: string
    }>
  >
}>

export default LieuHistoriquePage
