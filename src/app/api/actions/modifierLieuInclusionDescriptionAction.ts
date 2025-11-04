'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { LieuInclusion } from '@/domain/LieuInclusion'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierLieuInclusionDescription } from '@/use-cases/commands/ModifierLieuInclusionDescription'

export async function modifierLieuInclusionDescriptionAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  // Validation des paramètres
  const validationResult = validator.safeParse(actionParams)
  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  // Vérification des droits
  const sub = await getSessionSub()
  const utilisateurRepository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  const utilisateur = await utilisateurRepository.get(sub)

  const loader = new PrismaRecupererLieuDetailsLoader()
  const lieuDetailsReadModel = await loader.recuperer(actionParams.structureId)

  if ('type' in lieuDetailsReadModel) {
    return ['Lieu non trouvé']
  }

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

  const peutModifier = LieuInclusion.peutEtreModifiePar(
    utilisateur,
    lieuDetailsReadModel.codeDepartement,
    lieuDetailsReadModel.structureId,
    lieuDetailsReadModel.personnesTravaillant.length,
    departementsGouvernances
  )

  if (!peutModifier) {
    return ['Vous n\'avez pas les droits pour modifier ce lieu']
  }

  // Appel du Use Case
  const result = await new ModifierLieuInclusionDescription(
    new PrismaLieuInclusionRepository()
  ).handle({
    horaires: actionParams.horaires,
    itinerance: actionParams.itinerance,
    presentationDetail: actionParams.presentationDetail,
    presentationResume: actionParams.presentationResume,
    priseRdvUrl: actionParams.priseRdvUrl,
    structureId: actionParams.structureId,
    typologie: actionParams.typologie,
    websiteUrl: actionParams.websiteUrl,
  })

  // Invalider le cache de la page
  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  horaires?: string
  itinerance?: string
  path: string
  presentationDetail?: string
  presentationResume?: string
  priseRdvUrl?: string
  structureId: string
  typologie?: string
  websiteUrl?: string
}>

const validator = z.object({
  horaires: z.string().optional(),
  itinerance: z.string().optional(),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  presentationDetail: z.string().optional(),
  presentationResume: z.string().optional(),
  priseRdvUrl: z.string().optional(),
  structureId: z.string().min(1, { message: 'L\'identifiant de la structure doit être renseigné' }),
  typologie: z.string().optional(),
  websiteUrl: z.string().optional(),
})
