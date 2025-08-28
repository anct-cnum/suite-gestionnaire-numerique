import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import ListeAidantsMediateurs from '@/components/ListeAidantsMediateurs/ListeAidantsMediateurs'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeAidantsMediateursLoader } from '@/gateways/PrismaListeAidantsMediateursLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { listeAidantsMediateursPresenter } from '@/presenters/listeAidantsMediateursPresenter'
import { StatistiquesFilters } from '@/use-cases/queries/RecupererStatistiquesCoop'

export const metadata: Metadata = {
  title: 'Liste des aidants et mdiateurs numriques',
}

export default async function ListeAidantsMediateursController({
  searchParams,
}: {
  readonly searchParams: Promise<{ page?: string }>
}): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page ?? '1')
  const limite = 10

  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }
  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(session.user.sub)
  let territoire
  if (utilisateur.role.type === 'administrateur_dispositif') {
    territoire = 'France'
  }
  else{
    const departementCode = utilisateur.departementCode
    if(utilisateur.role.type !== 'gestionnaire_departement'
      ||  departementCode === null || departementCode === '' ) {
      redirect('/')
    }
    territoire = departementCode
  }

  const listeAidantsMediateursLoader = new PrismaListeAidantsMediateursLoader()
  const listeAidantsMediateursReadModel = await listeAidantsMediateursLoader.get(territoire, page, limite)
  const listeAidantsMediateursViewModel = listeAidantsMediateursPresenter(listeAidantsMediateursReadModel)

  const loader = createApiCoopStatistiquesLoader()
  const to = new Date()
  const from  = new Date()
  from.setDate(to.getDate() - 30)

  const filtre = {
    au: to.toISOString().split('T')[0],
    departements: territoire === 'France' ? [] : [territoire],
    du: from.toISOString().split('T')[0],
  } as StatistiquesFilters
  const result = await loader.recupererStatistiques(filtre)
  return (
    <ListeAidantsMediateurs
      beneficiaireViewModel={result.totaux.beneficiaires.total}
      listeAidantsMediateursViewModel={listeAidantsMediateursViewModel}
    />
  )
}
