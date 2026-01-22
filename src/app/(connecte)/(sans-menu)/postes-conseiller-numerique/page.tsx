import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import ListePostesConseillerNumerique from '@/components/PostesConseillerNumerique/ListePostesConseillerNumerique'
import { TypologieRole } from '@/domain/Role'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaPostesConseillerNumeriqueLoader } from '@/gateways/PrismaPostesConseillerNumeriqueLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { postesConseillerNumeriquePresenter } from '@/presenters/postesConseillerNumeriquePresenter'
import { buildFiltresPostesConseillerNumerique } from '@/shared/filtresPostesConseillerNumeriqueUtils'
import config from '@/use-cases/config.json'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export const metadata: Metadata = {
  title: 'Suivi des postes Conseiller Numérique',
}

export default async function PostesConseillerNumeriqueController({
  searchParams,
}: {
  readonly searchParams: Promise<{
    bonification?: string
    codeDepartement?: string
    codeRegion?: string
    conventions?: string
    page?: string
    statut?: string
    typesEmployeur?: string
    typesPoste?: string
  }>
}): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams

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

  // Utiliser la fonction utilitaire pour construire les filtres
  const filtres = buildFiltresPostesConseillerNumerique(
    resolvedSearchParams,
    territoire === 'France' ? undefined : territoire,
    config.utilisateursParPage
  )

  // Déterminer le territoire effectif pour le filtre :
  // - Si un département est sélectionné dans les filtres, utiliser ce département
  // - Si une région est sélectionnée dans les filtres, utiliser cette région
  // - Sinon, utiliser le territoire de l'utilisateur
  let territoireEffectif = territoire
  let codeRegionEffectif: string | undefined
  if (filtres.codeDepartement !== undefined) {
    territoireEffectif = filtres.codeDepartement
  } else if (filtres.codeRegion !== undefined) {
    territoireEffectif = 'France'
    codeRegionEffectif = filtres.codeRegion
  }

  const postesLoader = new PrismaPostesConseillerNumeriqueLoader()
  const postesReadModel = await postesLoader.get({
    bonification: filtres.bonification,
    codeRegion: codeRegionEffectif,
    conventions: filtres.conventions,
    pagination: {
      limite: filtres.limite,
      page: filtres.page,
    },
    statut: filtres.statut,
    territoire: territoireEffectif,
    typesEmployeur: filtres.typesEmployeur,
    typesPoste: filtres.typesPoste,
  })

  const postesConseillerNumeriqueViewModel = postesConseillerNumeriquePresenter(postesReadModel)

  // Passer les paramètres actuels pour l'affichage des filtres actifs
  const currentSearchParams = new URLSearchParams()
  setSearchParams()

  return (
    <ListePostesConseillerNumerique
      postesConseillerNumeriqueViewModel={postesConseillerNumeriqueViewModel}
      searchParams={currentSearchParams}
      utilisateurRole={utilisateur.role.nom as TypologieRole}
    />
  )

  function setSearchParams(): void {
    const paramKeys = [
      'bonification',
      'codeDepartement',
      'codeRegion',
      'conventions',
      'page',
      'statut',
      'typesEmployeur',
      'typesPoste',
    ] as const

    paramKeys.forEach((key) => {
      const value = resolvedSearchParams[key]
      if (value !== undefined && value !== '') {
        currentSearchParams.set(key, value)
      }
    })
  }
}
