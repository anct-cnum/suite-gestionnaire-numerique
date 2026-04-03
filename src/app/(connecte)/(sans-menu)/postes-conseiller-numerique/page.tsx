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
  const scopeFiltre = contexte.scopeFiltre()

  if (scopeFiltre.type === 'departemental' && scopeFiltre.codes.length === 0) {
    redirect('/')
  }

  const filtres = buildFiltresPostesConseillerNumerique(resolvedSearchParams, config.utilisateursParPage)

  const estAdmin = scopeFiltre.type === 'national'
  const codeDepartementEffectif = estAdmin && filtres.codeRegion === undefined ? filtres.codeDepartement : undefined

  const postesLoader = new PrismaPostesConseillerNumeriqueLoader()
  const postesReadModel = await postesLoader.get({
    bonification: filtres.bonification,
    codeDepartement: codeDepartementEffectif,
    codeRegion: filtres.codeRegion,
    conventions: filtres.conventions,
    pagination: {
      limite: filtres.limite,
      page: filtres.page,
    },
    scopeFiltre,
    statut: filtres.statut,
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
