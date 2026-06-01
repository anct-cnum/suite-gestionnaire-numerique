import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import StructuresDoublons from '@/components/StructuresDoublons/StructuresDoublons'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { Administrateur } from '@/domain/Administrateur'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaStructuresDoublonsLoader } from '@/gateways/PrismaStructuresDoublonsLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { structuresDoublonsPresenter } from '@/presenters/structuresDoublonsPresenter'
import { RechercherStructuresDoublons } from '@/use-cases/queries/RechercherStructuresDoublons'

export const metadata: Metadata = {
  title: 'Doublons de structures',
}

export default async function StructuresDoublonsController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).get(await getSessionSub())
  if (!(utilisateur instanceof Administrateur)) {
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
