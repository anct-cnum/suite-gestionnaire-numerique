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
import { ModifierLieuInclusionVisibiliteCartographie } from '@/use-cases/commands/ModifierLieuInclusionVisibiliteCartographie'

export async function modifierLieuInclusionVisibiliteCartographieAction(
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
  const lieuDetailsReadModel = await loader.recuperer(actionParams.lieuId)

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

  const departementsGouvernances = gouvernancesDepartements.map((membre) => membre.gouvernanceDepartementCode)

  const peutModifier = LieuInclusion.peutEtreModifiePar(
    utilisateur,
    lieuDetailsReadModel.codeDepartement,
    lieuDetailsReadModel.structureId,
    lieuDetailsReadModel.personnesTravaillant.length,
    departementsGouvernances
  )

  if (!peutModifier) {
    return ["Vous n'avez pas les droits pour modifier ce lieu"]
  }

  // Appel du Use Case
  const result = await new ModifierLieuInclusionVisibiliteCartographie(
    new PrismaLieuInclusionRepository(),
    new Date()
  ).handle({
    lieuId: actionParams.lieuId,
    visiblePourCartographie: actionParams.visiblePourCartographie,
  })

  // Invalider le cache de la page
  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  lieuId: string
  path: string
  visiblePourCartographie: boolean
}>

const validator = z.object({
  lieuId: z.string().min(1, { message: "L'identifiant du lieu doit être renseigné" }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  visiblePourCartographie: z.boolean(),
})
