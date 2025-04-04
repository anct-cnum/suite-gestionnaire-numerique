import { Metadata } from 'next'
import { ReactElement } from 'react'

import departements from '../../../../../ressources/departements.json'
import groupements from '../../../../../ressources/groupements.json'
import regions from '../../../../../ressources/regions.json'
import MesUtilisateurs from '@/components/MesUtilisateurs/MesUtilisateurs'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { mesUtilisateursPresenter, RolesAvecStructure } from '@/presenters/mesUtilisateursPresenter'
import { isNullishOrEmpty } from '@/shared/lang'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'

export const metadata: Metadata = {
  title: 'Mes utilisateurs',
}

export default async function MesUtilisateursController({ searchParams }: Props): Promise<ReactElement> {
  const sub = await getSessionSub()
  const searchParamsAwaited = await searchParams
  const pageAwaited = searchParamsAwaited.page
  const pageCourante = isNullishOrEmpty(pageAwaited) ? {} : { pageCourante: Number(pageAwaited) }
  const utilisateursActives = Boolean(searchParamsAwaited.utilisateursActives)
  const codeDepartement = isNullishOrEmpty(searchParamsAwaited.codeDepartement)
    ? {}
    : { codeDepartement: searchParamsAwaited.codeDepartement }
  const codeRegionAwaited = searchParamsAwaited.codeRegion
  const codeRegion = isNullishOrEmpty(codeRegionAwaited) ? {} : { codeRegion: codeRegionAwaited }
  const rolesAwaited = searchParamsAwaited.roles
  const roles = isNullishOrEmpty(rolesAwaited) ? {} : { roles: rolesAwaited?.split(',') }
  const structureAwaited = searchParamsAwaited.structure
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const idStructure = isNullishOrEmpty(structureAwaited) ? undefined : { idStructure: Number(structureAwaited!) }
  const prenomOuNomOuEmailAwaited = searchParamsAwaited.prenomOuNomOuEmail
  const prenomOuNomOuEmail = isNullishOrEmpty(prenomOuNomOuEmailAwaited) ? undefined : prenomOuNomOuEmailAwaited

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(utilisateurLoader)
  const { total, utilisateursCourants } =
    await rechercherMesUtilisateurs.handle({
      uid: sub,
      utilisateursActives,
      ...codeDepartement,
      ...codeRegion,
      ...pageCourante,
      ...roles,
      ...idStructure,
      prenomOuNomOuEmail,
    })

  const rolesAvecStructure: RolesAvecStructure = {
    'Gestionnaire département': {
      label: 'Département',
      options: departements.map((departement) => ({ label: departement.nom, value: departement.code })),
      placeholder: 'Nom du département',
    },
    'Gestionnaire groupement': {
      label: 'Groupement',
      options: groupements.map((groupement) => ({ label: groupement.nom, value: `${groupement.id}` })),
      placeholder: 'Nom du groupement',
    },
    'Gestionnaire région': {
      label: 'Région',
      options: regions.map((region) => ({ label: region.nom, value: region.code })),
      placeholder: 'Nom de la région',
    },
    'Gestionnaire structure': {
      label: 'Structure',
      options: [],
      placeholder: 'Nom de la structure',
    },
  }

  const mesUtilisateursViewModel = mesUtilisateursPresenter(
    utilisateursCourants,
    sub,
    total,
    rolesAvecStructure,
    new Date()
  )

  return (
    <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />
  )
}

type Props = Readonly<{
  searchParams: Promise<Partial<Readonly<{
    codeDepartement: string
    codeRegion: string
    page: string
    prenomOuNomOuEmail: string
    roles: string
    structure: string
    utilisateursActives: string
  }>>>
}>
