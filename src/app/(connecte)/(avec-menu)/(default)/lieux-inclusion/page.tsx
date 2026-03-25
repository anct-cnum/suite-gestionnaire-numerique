import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import LieuxInclusion from '@/components/LieuxInclusion/LieuxInclusion'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/lieuxInclusionNumeriquePresenter'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: "Lieux d'inclusion",
}

export default async function LieuxInclusionController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const codesDepartements = contexte.codesDepartements()

  const loader = new PrismaLieuxInclusionNumeriqueLoader()

  let result
  if (contexte.estNational()) {
    result = await loader.getNational()
  } else if (codesDepartements.length > 1) {
    result = await loader.getDepartementaux(codesDepartements)
  } else if (codesDepartements.length === 1) {
    result = await loader.getDepartemental(codesDepartements[0])
  } else {
    redirect('/')
  }

  const viewModel = lieuxInclusionNumeriquePresenter(result)

  return (<LieuxInclusion viewModel={viewModel} />)
}
