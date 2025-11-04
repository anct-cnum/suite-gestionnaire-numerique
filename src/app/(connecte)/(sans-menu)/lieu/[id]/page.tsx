import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import LieuxInclusionDetails from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import { LieuInclusion } from '@/domain/LieuInclusion'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { lieuDetailsPresenter } from '@/presenters/LieuDetailsPresenter'

export const metadata: Metadata = {
  title: 'Détails du lieu d\'inclusion ',
}

async function LieuPage({ params }: Props) : Promise<ReactElement>{
  const { id } = await params

  const loader = new PrismaRecupererLieuDetailsLoader()
  const lieuDetailsReadModel = await loader.recuperer(id)

  if ('type' in lieuDetailsReadModel) {
    notFound()
  }

  // Récupérer l'utilisateur connecté
  const sub = await getSessionSub()
  const utilisateurRepository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  const utilisateur = await utilisateurRepository.get(sub)

  // Récupérer les départements des gouvernances dont la structure est membre
  const gouvernancesDepartements = await prisma.membreRecord.findMany({
    select: {
      gouvernanceDepartementCode: true,
    },
    where: {
      dateSuppression: null,
      structureId: lieuDetailsReadModel.structureId,
    },
  })

  const departementsGouvernances = gouvernancesDepartements.map(
    (membre) => membre.gouvernanceDepartementCode
  )

  // Calculer si l'utilisateur peut modifier ce lieu
  const peutModifier = LieuInclusion.peutEtreModifiePar(
    utilisateur,
    lieuDetailsReadModel.codeDepartement,
    lieuDetailsReadModel.structureId,
    lieuDetailsReadModel.personnesTravaillant.length,
    departementsGouvernances
  )

  const presentedData = lieuDetailsPresenter(lieuDetailsReadModel, peutModifier)

  return (
    <LieuxInclusionDetails data={presentedData} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    id: string
  }>>
}>

export default LieuPage
