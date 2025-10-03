import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import ListeAidantsMediateurs from '@/components/ListeAidantsMediateurs/ListeAidantsMediateurs'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeAidantsMediateursLoader } from '@/gateways/PrismaListeAidantsMediateursLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { listeAidantsMediateursPresenter } from '@/presenters/listeAidantsMediateursPresenter'
import { buildFiltresListeAidants } from '@/shared/filtresAidantsMediateursUtils'
import { fetchTotalBeneficiaires } from '@/use-cases/queries/fetchBeneficiaires'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export const metadata: Metadata = {
  title: 'Liste des aidants et médiateurs numriques',
}

export default async function ListeAidantsMediateursController({
  searchParams,
}: {
  readonly searchParams: Promise<{
    codeDepartement?: string
    codeRegion?: string
    formations?: string
    habilitations?: string
    page?: string
    roles?: string
  }>
}): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams

  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }
  const utilisateurLoader = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  const utilisateur = await utilisateurLoader.get(await getSessionSub())

  const territoireUseCase = new RecupererTerritoireUtilisateur(new PrismaMembreLoader())
  const territoireResult = await territoireUseCase.handle(utilisateur)

  let territoire: string
  if (territoireResult.type === 'france') {
    territoire = 'France'
  } else if (territoireResult.codes.length > 0) {
    territoire = territoireResult.codes[0]
  } else {
    redirect('/')
  }

  // Utiliser la fonction utilitaire pour construire les filtres
  const filtres = buildFiltresListeAidants(
    resolvedSearchParams,
    territoire,
    utilisateur.state.role.nom
  )

  const listeAidantsMediateursLoader = new PrismaListeAidantsMediateursLoader()
  const listeAidantsMediateursReadModel = await listeAidantsMediateursLoader.get(filtres)
  const listeAidantsMediateursViewModel = listeAidantsMediateursPresenter(listeAidantsMediateursReadModel)

  // Créer la promesse pour les accompagnements
  let accompagnementsPromise: Promise<Map<string, number>>
  if ('type' in listeAidantsMediateursViewModel) {
    // En cas d'erreur, retourner une Map vide
    accompagnementsPromise = Promise.resolve(new Map<string, number>())
  } else {
    // Extraire les IDs des aidants pour charger leurs accompagnements
    const viewModel = listeAidantsMediateursViewModel as {
      aidants: Array<{ id: string }>
    }
    const aidantIds = viewModel.aidants.map(aidant => aidant.id)
    accompagnementsPromise = listeAidantsMediateursLoader.getAccompagnementsForPersonnes(aidantIds)
  }

  // Calculer la période de 30 jours pour les stats des bénéficiaires
  const jusqua = new Date()
  const depuis = new Date()
  depuis.setDate(jusqua.getDate() - 30)

  const totalBeneficiairesPromise = fetchTotalBeneficiaires(
    territoire === 'France' ? undefined : territoire,
    { depuis, jusqua }
  )

  // Passer les paramètres actuels pour l'affichage des filtres actifs
  const currentSearchParams = new URLSearchParams()
  const { codeDepartement, codeRegion, formations, habilitations, page, roles } = resolvedSearchParams
  setSearchParams()

  return (
    <ListeAidantsMediateurs
      accompagnementsPromise={accompagnementsPromise}
      listeAidantsMediateursViewModel={listeAidantsMediateursViewModel}
      searchParams={currentSearchParams}
      totalBeneficiairesPromise={totalBeneficiairesPromise}
      utilisateurRole={utilisateur.state.role.nom}
    />
  )

  function setSearchParams(): void {
    if (page !== undefined && page !== '') {
      currentSearchParams.set('page', page)
    }
    if (codeDepartement !== undefined && codeDepartement !== '') {
      currentSearchParams.set('codeDepartement', codeDepartement)
    }
    if (codeRegion !== undefined && codeRegion !== '') {
      currentSearchParams.set('codeRegion', codeRegion)
    }
    if (roles !== undefined && roles !== '') {
      currentSearchParams.set('roles', roles)
    }
    if (habilitations !== undefined && habilitations !== '') {
      currentSearchParams.set('habilitations', habilitations)
    }
    if (formations !== undefined && formations !== '') {
      currentSearchParams.set('formations', formations)
    }
  }
}
