import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import LieuxInclusion from '@/components/LieuxInclusion/LieuxInclusion'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import {
  LieuxInclusionNumeriqueReadModel,
  PrismaLieuxInclusionNumeriqueLoader,
} from '@/gateways/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/lieuxInclusionNumeriquePresenter'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export const metadata: Metadata = {
  title: 'Lieux d’inclusion',
}

export default async function LieuxInclusionController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  const utilisateur = await utilisateurLoader.get(await getSessionSub())

  const territoireUseCase = new RecupererTerritoireUtilisateur(new PrismaMembreLoader())
  const territoire = await territoireUseCase.handle(utilisateur)

  const loader = new PrismaLieuxInclusionNumeriqueLoader()
  let result: LieuxInclusionNumeriqueReadModel

  if (territoire.type === 'france') {
    result = await loader.getNational()
  } else if (territoire.codes.length > 0) {
    result = await loader.getDepartemental(territoire.codes[0])
  } else {
    redirect('/')
  }

  const viewModel = lieuxInclusionNumeriquePresenter(result)

  return (<LieuxInclusion viewModel={viewModel} />)
}
