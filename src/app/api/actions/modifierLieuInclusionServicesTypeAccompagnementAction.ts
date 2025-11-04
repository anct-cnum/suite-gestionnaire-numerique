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
import { ModifierLieuInclusionServicesTypeAccompagnement } from '@/use-cases/commands/ModifierLieuInclusionServicesTypeAccompagnement'

export async function modifierLieuInclusionServicesTypeAccompagnementAction(
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
  const result = await new ModifierLieuInclusionServicesTypeAccompagnement(
    new PrismaLieuInclusionRepository()
  ).handle({
    modalites: actionParams.modalites,
    structureId: actionParams.structureId,
    thematiques: actionParams.thematiques,
    typesAccompagnement: actionParams.typesAccompagnement,
  })

  // Invalider le cache de la page
  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  modalites: ReadonlyArray<string>
  path: string
  structureId: string
  thematiques: ReadonlyArray<string>
  typesAccompagnement: ReadonlyArray<string>
}>

const validator = z.object({
  modalites: z.array(z.string()),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  structureId: z.string().min(1, { message: 'L\'identifiant de la structure doit être renseigné' }),
  thematiques: z.array(z.string()),
  typesAccompagnement: z.array(z.string()),
})
