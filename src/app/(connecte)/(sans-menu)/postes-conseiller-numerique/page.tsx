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
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

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

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const codesDepartements = contexte.codesDepartements()

  let territoire: string
  let codesDepartementsScope: ReadonlyArray<string> | undefined
  if (contexte.estNational()) {
    territoire = 'France'
  } else if (codesDepartements.length > 1) {
    territoire = 'France'
    codesDepartementsScope = codesDepartements
  } else if (codesDepartements.length === 1) {
    territoire = codesDepartements[0]
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
  // Quand un dept est sélectionné, il prend la priorité et annule le scope multi-dept
  if (filtres.codeDepartement !== undefined) {
    territoireEffectif = filtres.codeDepartement
    codesDepartementsScope = undefined
  } else if (filtres.codeRegion !== undefined) {
    territoireEffectif = 'France'
    codesDepartementsScope = undefined
    codeRegionEffectif = filtres.codeRegion
  }

  const postesLoader = new PrismaPostesConseillerNumeriqueLoader()
  const postesReadModel = await postesLoader.get({
    bonification: filtres.bonification,
    codeRegion: codeRegionEffectif,
    codesDepartementsScope,
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
