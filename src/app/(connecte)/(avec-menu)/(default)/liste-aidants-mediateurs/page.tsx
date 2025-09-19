/* eslint-disable complexity */
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import ListeAidantsMediateurs from '@/components/ListeAidantsMediateurs/ListeAidantsMediateurs'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeAidantsMediateursLoader } from '@/gateways/PrismaListeAidantsMediateursLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { listeAidantsMediateursPresenter } from '@/presenters/listeAidantsMediateursPresenter'
import { fetchTotalBeneficiaires } from '@/use-cases/queries/fetchBeneficiaires'
import { FiltreFormations, FiltreGeographique, FiltreHabilitations, FiltreRoles, FiltresListeAidants } from '@/use-cases/queries/RecupererListeAidantsMediateurs'

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
  const page = Number(resolvedSearchParams.page ?? '1')
  const { codeDepartement, codeRegion, formations, habilitations, roles } = resolvedSearchParams
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

  // Construction du filtre géographique - seulement pour les administrateurs
  let filtreGeographique: FiltreGeographique | undefined

  // Seuls les administrateur_dispositif peuvent utiliser le filtre géographique
  if (utilisateur.role.type === 'administrateur_dispositif') {
    if (codeDepartement !== undefined && codeDepartement !== '') {
      filtreGeographique = {
        code: codeDepartement,
        type: 'departement',
      }
    } else if (codeRegion !== undefined && codeRegion !== '') {
      filtreGeographique = {
        code: codeRegion,
        type: 'region',
      }
    }
  }
  // Pour les autres utilisateurs, ignorer les filtres géographiques dans l'URL

  // Construction de l'objet filtres
  const filtres: FiltresListeAidants = {
    formations: formations ? formations.split(',') as FiltreFormations : undefined,
    geographique: filtreGeographique,
    habilitations: habilitations ? habilitations.split(',') as FiltreHabilitations : undefined,
    pagination: {
      limite,
      page,
    },
    roles: roles ? roles.split(',') as FiltreRoles : undefined,
    territoire,
  }

  const listeAidantsMediateursLoader = new PrismaListeAidantsMediateursLoader()
  const listeAidantsMediateursReadModel = await listeAidantsMediateursLoader.get(filtres)
  const listeAidantsMediateursViewModel = listeAidantsMediateursPresenter(listeAidantsMediateursReadModel)

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
  if (resolvedSearchParams.page !== undefined && resolvedSearchParams.page !== '') {
    currentSearchParams.set('page', resolvedSearchParams.page)
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

  return (
    <ListeAidantsMediateurs
      listeAidantsMediateursViewModel={listeAidantsMediateursViewModel}
      searchParams={currentSearchParams}
      totalBeneficiairesPromise={totalBeneficiairesPromise}
    />
  )
}
