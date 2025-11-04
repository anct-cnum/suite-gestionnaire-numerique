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
import { ModifierLieuInclusionServicesTypePublic } from '@/use-cases/commands/ModifierLieuInclusionServicesTypePublic'

export async function modifierLieuInclusionServicesTypePublicAction(
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
  const result = await new ModifierLieuInclusionServicesTypePublic(
    new PrismaLieuInclusionRepository()
  ).handle({
    priseEnChargeSpecifique: actionParams.priseEnChargeSpecifique,
    publicsSpecifiquementAdresses: actionParams.publicsSpecifiquementAdresses,
    structureId: actionParams.structureId,
  })

  // Invalider le cache de la page
  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  path: string
  priseEnChargeSpecifique: ReadonlyArray<string>
  publicsSpecifiquementAdresses: ReadonlyArray<string>
  structureId: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  priseEnChargeSpecifique: z.array(z.string()),
  publicsSpecifiquementAdresses: z.array(z.string()),
  structureId: z.string().min(1, { message: 'L\'identifiant de la structure doit être renseigné' }),
})
