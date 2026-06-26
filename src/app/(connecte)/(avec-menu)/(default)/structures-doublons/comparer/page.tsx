import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import ComparerStructures from '@/components/StructuresDoublons/ComparerStructures'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructuresComparaisonLoader } from '@/gateways/PrismaStructuresComparaisonLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { comparaisonDoublonsPresenter } from '@/presenters/comparaisonDoublonsPresenter'
import { ComparerStructuresAFusionner } from '@/use-cases/queries/ComparerStructuresAFusionner'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Examiner un doublon de structures',
}

export default async function ComparerStructuresController({ searchParams }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
    redirect('/tableau-de-bord')
  }

  const { ids } = await searchParams
  const idsStructures = (ids ?? '')
    .split(',')
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0)

  if (idsStructures.length < 2) {
    redirect('/structures-doublons')
  }

  const readModel = await new ComparerStructuresAFusionner(new PrismaStructuresComparaisonLoader()).handle({
    ids: idsStructures,
  })
  const viewModel = comparaisonDoublonsPresenter(readModel)

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: '/structures-doublons', label: 'Doublons de structures' },
          { label: 'Examiner' },
        ]}
      />
      <ComparerStructures viewModel={viewModel} />
    </>
  )
}

type Props = Readonly<{
  searchParams: Promise<Readonly<{ ids?: string }>>
}>
