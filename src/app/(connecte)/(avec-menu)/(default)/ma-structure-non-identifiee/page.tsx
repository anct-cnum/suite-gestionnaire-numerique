import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import MaStructureNonIdentifiee from '@/components/MaStructureNonIdentifiee/MaStructureNonIdentifiee'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'

export const metadata: Metadata = {
  title: 'Ma structure',
}

export default async function MaStructureNonIdentifieeController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)

  if (utilisateur.structureId !== null) {
    redirect(`/structure/${utilisateur.structureId}`)
  }

  if (utilisateur.role.type !== 'gestionnaire_departement') {
    notFound()
  }

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Ma structure' }]} />
      <MaStructureNonIdentifiee departement={utilisateur.role.organisation} />
    </>
  )
}
