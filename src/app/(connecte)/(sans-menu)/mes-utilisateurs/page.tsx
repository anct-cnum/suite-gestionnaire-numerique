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
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'

export const metadata: Metadata = {
  title: 'Mes utilisateurs',
}

export default async function MesUtilisateursController({ searchParams }: PageProps): Promise<ReactElement> {
  const sub = await getSubSession()
  const pageCourante = searchParams.page !== undefined ? { pageCourante: Number(searchParams.page) } : {}
  const utilisateursActives = Boolean(searchParams.utilisateursActives)
  const codeDepartement =
    searchParams.codeDepartement !== undefined ? { codeDepartement: searchParams.codeDepartement } : {}
  const codeRegion = searchParams.codeRegion !== undefined ? { codeRegion: searchParams.codeRegion } : {}
  const roles = searchParams.roles === undefined || searchParams.roles === '' ? {} : { roles: searchParams.roles.split(',') }

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
  searchParams: Partial<Readonly<{
    codeDepartement: string
    codeRegion: string
    page: string
    roles: string
    utilisateursActives: string
  }>>
}>
