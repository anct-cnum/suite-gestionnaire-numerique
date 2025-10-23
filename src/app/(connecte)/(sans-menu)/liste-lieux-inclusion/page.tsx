import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import ListeLieuxInclusion from '@/components/ListeLieuxInclusion/ListeLieuxInclusion'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { TypologieRole } from '@/domain/Role'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeLieuxInclusionLoader } from '@/gateways/PrismaListeLieuxInclusionLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { listeLieuxInclusionPresenter } from '@/presenters/listeLieuxInclusionPresenter'
import { buildFiltresLieuxInclusion } from '@/shared/filtresLieuxInclusionUtils'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export const metadata: Metadata = {
  title: 'Liste des lieux d\'inclusion numérique',
}

export default async function ListeLieuxInclusionController({
  searchParams,
}: {
  readonly searchParams: Promise<{
    codeDepartement?: string
    codeRegion?: string
    frr?: string
    horsZonePrioritaire?: string
    page?: string
    qpv?: string
    typeStructure?: string
  }>
}): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

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

  const resolvedSearchParams = await searchParams

  // Utiliser la fonction utilitaire pour construire les filtres
  const filtres = buildFiltresLieuxInclusion(
    resolvedSearchParams,
    territoire === 'France' ? undefined : territoire
  )

  const listeLieuxInclusionLoader = new PrismaListeLieuxInclusionLoader()

  // Récupérer les lieux et les types de structure en parallèle
  const [listeLieuxInclusionReadModel, typesStructure] = await Promise.all([
    listeLieuxInclusionLoader.getLieuxWithPagination(
      filtres.page,
      filtres.limite,
      filtres.codeDepartement,
      filtres.typeStructure,
      filtres.qpv,
      filtres.frr,
      filtres.codeRegion,
      filtres.horsZonePrioritaire
    ),
    listeLieuxInclusionLoader.getTypesStructure(),
  ])

  const listeLieuxInclusionViewModel = handleReadModelOrError(
    listeLieuxInclusionReadModel,
    listeLieuxInclusionPresenter
  )

  // Passer les paramètres actuels pour l'affichage des filtres actifs
  const currentSearchParams = new URLSearchParams()
  const { codeDepartement, codeRegion, frr, horsZonePrioritaire, page, qpv, typeStructure } = resolvedSearchParams
  setSearchParams()

  return (
    <ListeLieuxInclusion
      listeLieuxInclusionViewModel={listeLieuxInclusionViewModel}
      searchParams={currentSearchParams}
      typesStructure={typesStructure}
      utilisateurRole={utilisateur.role.nom as TypologieRole}
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
    if (typeStructure !== undefined && typeStructure !== '') {
      currentSearchParams.set('typeStructure', typeStructure)
    }
    if (qpv !== undefined && qpv !== '') {
      currentSearchParams.set('qpv', qpv)
    }
    if (frr !== undefined && frr !== '') {
      currentSearchParams.set('frr', frr)
    }
    if (horsZonePrioritaire !== undefined && horsZonePrioritaire !== '') {
      currentSearchParams.set('horsZonePrioritaire', horsZonePrioritaire)
    }
  }
}
