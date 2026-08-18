import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import DoublonsProfessionnels from '@/components/DoublonsProfessionnels/DoublonsProfessionnels'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaDoublonsProfessionnelsLoader } from '@/gateways/PrismaDoublonsProfessionnelsLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { doublonsProfessionnelsPresenter } from '@/presenters/doublonsProfessionnelsPresenter'
import { RecupererDoublonsProfessionnels } from '@/use-cases/queries/RecupererDoublonsProfessionnels'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Doublons de professionnels',
}

// Page brute sans point d'entrée dans la navigation (accès par URL directe),
// réservée aux administrateurs. Cf ticket #1824.
export default async function DoublonsProfessionnelsController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif')) {
    redirect('/tableau-de-bord')
  }

  const readModel = await new RecupererDoublonsProfessionnels(new PrismaDoublonsProfessionnelsLoader()).handle()
  const viewModel = doublonsProfessionnelsPresenter(readModel)

  return <DoublonsProfessionnels viewModel={viewModel} />
}
