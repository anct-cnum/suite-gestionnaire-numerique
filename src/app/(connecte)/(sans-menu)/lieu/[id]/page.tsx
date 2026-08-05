import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import LieuxInclusionDetails from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { LieuInclusion } from '@/domain/LieuInclusion'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { lieuDetailsPresenter } from '@/presenters/LieuDetailsPresenter'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: "Détails du lieu d'inclusion ",
}

async function LieuPage({ params }: Props): Promise<ReactElement> {
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

  const departementsGouvernances = gouvernancesDepartements.map((membre) => membre.gouvernanceDepartementCode)

  // Calculer si l'utilisateur peut modifier ce lieu
  const peutModifier = LieuInclusion.peutEtreModifiePar(
    utilisateur,
    lieuDetailsReadModel.codeDepartement,
    lieuDetailsReadModel.structureId,
    lieuDetailsReadModel.personnesTravaillant.length,
    departementsGouvernances
  )

  // Édition des informations générales réservée aux bêta-testeurs.
  const contexte = await resoudreContexte(await new PrismaUtilisateurLoader().findByUid(sub), new PrismaMembreLoader())
  const peutModifierInformationsGenerales = peutModifier && contexte.isBetaTesteur

  const presentedData = lieuDetailsPresenter(
    lieuDetailsReadModel,
    peutModifier,
    peutModifierInformationsGenerales,
    new Date()
  )

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: '/liste-lieux-inclusion', label: 'Suivi des lieux' },
          { label: presentedData.header.nom },
        ]}
      />
      <LieuxInclusionDetails data={presentedData} lieuId={id} peutSupprimer={peutModifier && contexte.isBetaTesteur} />
    </>
  )
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      id: string
    }>
  >
}>

export default LieuPage
