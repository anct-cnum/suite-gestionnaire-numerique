import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import StructureEmployeuseHistorique from '@/components/StructureEmployeuseHistorique/StructureEmployeuseHistorique'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureHistoriqueLoader } from '@/gateways/PrismaStructureHistoriqueLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { structureHistoriquePresenter } from '@/presenters/structureHistoriquePresenter'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Historique de la structure employeuse',
}

async function StructureHistoriquePage({ params }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
    redirect('/tableau-de-bord')
  }

  const { structureId } = await params

  const loader = new PrismaStructureHistoriqueLoader()
  const readModel = await loader.recuperer(structureId)

  if ('type' in readModel) {
    notFound()
  }

  const viewModel = structureHistoriquePresenter(readModel)

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: `/structure/${structureId}`, label: viewModel.denomination },
          { label: 'Historique' },
        ]}
      />
      <StructureEmployeuseHistorique structureId={structureId} viewModel={viewModel} />
    </>
  )
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      structureId: string
    }>
  >
}>

export default StructureHistoriquePage
