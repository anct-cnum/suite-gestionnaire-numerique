import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import LieuxInclusion from '@/components/LieuxInclusion/LieuxInclusion'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import {
  LieuxInclusionNumeriqueReadModel,
  PrismaLieuxInclusionNumeriqueLoader,
} from '@/gateways/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/lieuxInclusionNumeriquePresenter'

export const metadata: Metadata = {
  title: 'Lieux d’inclusion',
}

export default async function LieuxInclusionController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(session.user.sub)
  const loader = new PrismaLieuxInclusionNumeriqueLoader()
  let result: LieuxInclusionNumeriqueReadModel
  if (utilisateur.role.type === 'administrateur_dispositif') {
    result = await loader.getNational()
  }
  else{
    const departementCode = utilisateur.departementCode
    if(utilisateur.role.type !== 'gestionnaire_departement'
      ||  departementCode === null || departementCode === '' ) {
      redirect('/')
    }
    result= await loader.getDepartemental(departementCode)
  }

  const viewModel = lieuxInclusionNumeriquePresenter(result)

  return (<LieuxInclusion viewModel={viewModel} />)
}
