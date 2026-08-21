import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import departements from '../../../../../ressources/departements.json'
import ListeStructures from '@/components/ListeStructures/ListeStructures'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeStructuresLoader } from '@/gateways/PrismaListeStructuresLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { listeStructuresPresenter } from '@/presenters/listeStructuresPresenter'
import { buildFiltresListeStructures } from '@/shared/filtresListeStructuresUtils'
import { resoudreContexte, ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Liste des structures',
}

export default async function ListeStructuresController({
  searchParams,
}: {
  readonly searchParams: Promise<{
    codeDepartement?: string
    codeEpci?: string
    codeRegion?: string
    labellisation?: string
    page?: string
    recherche?: string
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

  const filtres = buildFiltresListeStructures(resolvedSearchParams, scopeFiltre)

  const readModel = await new PrismaListeStructuresLoader().get(filtres)
  const viewModel = listeStructuresPresenter(readModel, new Date())

  const currentSearchParams = new URLSearchParams()
  for (const [cle, valeur] of Object.entries(resolvedSearchParams)) {
    if (valeur !== '') {
      currentSearchParams.set(cle, valeur)
    }
  }

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Structures' }]} />
      <ListeStructures
        estScopeNational={scopeFiltre.type === 'national'}
        libelleTerritoireRestreint={libelleTerritoireRestreint(scopeFiltre)}
        searchParams={currentSearchParams}
        viewModel={viewModel}
      />
    </>
  )
}

function libelleTerritoireRestreint(scopeFiltre: ScopeFiltre): string {
  if (scopeFiltre.type !== 'departemental') {
    return ''
  }
  return scopeFiltre.codes
    .map((code) => {
      const departement = departements.find((dept) => dept.code === code)
      return departement ? `${departement.nom} (${departement.code})` : code
    })
    .join(', ')
}
