import { Metadata } from 'next'
import { ReactElement } from 'react'

import prisma from '../../../../../prisma/prismaClient'
import departements from '../../../../../ressources/departements.json'
import groupements from '../../../../../ressources/groupements.json'
import regions from '../../../../../ressources/regions.json'
import MesUtilisateurs from '@/components/MesUtilisateurs/MesUtilisateurs'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { mesUtilisateursPresenter, RolesAvecStructure } from '@/presenters/mesUtilisateursPresenter'
import { isNullishOrEmpty } from '@/shared/lang'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'

export const metadata: Metadata = {
  title: 'Mes utilisateurs',
}

export default async function MesUtilisateursController({ searchParams }: PageProps): Promise<ReactElement> {
  const sub = await getSubSession()
  const pageAwaited = (await searchParams).page
  const pageCourante = isNullishOrEmpty(pageAwaited) ? {} : { pageCourante: Number(pageAwaited) }
  const utilisateursActives = Boolean((await searchParams).utilisateursActives)
  const codeDepartement = isNullishOrEmpty((await searchParams).codeDepartement)
    ? {}
    : { codeDepartement: (await searchParams).codeDepartement }
  const codeRegionAwaited = (await searchParams).codeRegion
  const codeRegion = isNullishOrEmpty(codeRegionAwaited) ? {} : { codeRegion: codeRegionAwaited }
  const rolesAwaited = (await searchParams).roles
  const roles = isNullishOrEmpty(rolesAwaited) ? {} : { roles: rolesAwaited?.split(',') }
  const structureAwaited = (await searchParams).structure
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const idStructure = isNullishOrEmpty(structureAwaited) ? {} : { idStructure: +structureAwaited! }

  const utilisateurLoader = new PrismaUtilisateurLoader(prisma)
  const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(utilisateurLoader)
  const { utilisateursCourants, total } =
    await rechercherMesUtilisateurs.get({
      uid: sub,
      utilisateursActives,
      ...codeDepartement,
      ...codeRegion,
      ...pageCourante,
      ...roles,
      ...idStructure,
    })

  const rolesAvecStructure: RolesAvecStructure = {
    'Gestionnaire département': {
      label: 'Département',
      options: departements.map((departement) => ({ label: departement.nom, value: departement.code })),
    },
    'Gestionnaire groupement': {
      label: 'Groupement',
      options: groupements.map((groupement) => ({ label: groupement.nom, value: `${groupement.id}` })),
    },
    'Gestionnaire région': {
      label: 'Région',
      options: regions.map((region) => ({ label: region.nom, value: region.code })),
    },
    'Gestionnaire structure': {
      label: 'Structure',
      options: [],
    },
  }

  const mesUtilisateursViewModel = mesUtilisateursPresenter(
    utilisateursCourants,
    sub,
    total,
    rolesAvecStructure
  )

  return (
    <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />
  )
}

type PageProps = Readonly<{
  searchParams: Promise<Partial<Readonly<{
    codeDepartement: string
    codeRegion: string
    page: string
    roles: string
    utilisateursActives: string
    structure: string
  }>>>
}>
