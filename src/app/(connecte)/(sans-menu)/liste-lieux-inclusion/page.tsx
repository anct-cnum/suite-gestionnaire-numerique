import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import ListeLieuxInclusion from '@/components/ListeLieuxInclusion/ListeLieuxInclusion'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { TypologieRole } from '@/domain/Role'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeLieuxInclusionLoader } from '@/gateways/PrismaListeLieuxInclusionLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { listeLieuxInclusionPresenter } from '@/presenters/listeLieuxInclusionPresenter'
import { buildFiltresLieuxInclusion } from '@/shared/filtresLieuxInclusionUtils'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: "Liste des lieux d'inclusion numérique",
}

export default async function ListeLieuxInclusionController({
  searchParams,
}: {
  readonly searchParams: Promise<{
    codeDepartement?: string
    codeEpci?: string
    codeRegion?: string
    fraicheur?: string
    frr?: string
    horsZonePrioritaire?: string
    nom?: string
    page?: string
    qpv?: string
    statut?: string
  }>
}): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findById(await getSessionUtilisateurId())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const scopeFiltre = contexte.scopeFiltre()

  if (scopeFiltre.type === 'departemental' && scopeFiltre.codes.length === 0) {
    redirect('/')
  }

  const resolvedSearchParams = await searchParams

  const now = new Date()
  const filtres = buildFiltresLieuxInclusion(resolvedSearchParams, scopeFiltre, now)

  const listeLieuxInclusionLoader = new PrismaListeLieuxInclusionLoader()
  const listeLieuxInclusionReadModel = await listeLieuxInclusionLoader.getLieux(filtres)

  const listeLieuxInclusionViewModel = handleReadModelOrError(listeLieuxInclusionReadModel, (readModel) =>
    listeLieuxInclusionPresenter(readModel, now)
  )

  const currentSearchParams = new URLSearchParams()
  const { codeDepartement, codeEpci, codeRegion, fraicheur, frr, horsZonePrioritaire, nom, page, qpv, statut } =
    resolvedSearchParams
  setSearchParams()

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Suivi des lieux' }]} />
      <ListeLieuxInclusion
        listeLieuxInclusionViewModel={listeLieuxInclusionViewModel}
        peutSupprimer={contexte.isBetaTesteur}
        searchParams={currentSearchParams}
        utilisateurRole={utilisateur.role.nom as TypologieRole}
      />
    </>
  )

  function setSearchParams(): void {
    if (statut === 'archives') {
      currentSearchParams.set('statut', 'archives')
    }
    const parametres = { codeDepartement, codeEpci, codeRegion, fraicheur, frr, horsZonePrioritaire, nom, page, qpv }
    for (const [cle, valeur] of Object.entries(parametres)) {
      if (valeur !== undefined && valeur !== '') {
        currentSearchParams.set(cle, valeur)
      }
    }
  }
}
