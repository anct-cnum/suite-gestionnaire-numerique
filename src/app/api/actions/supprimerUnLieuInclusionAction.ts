'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import prisma from '../../../../prisma/prismaClient'
import { LieuInclusion } from '@/domain/LieuInclusion'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnLieuInclusion } from '@/use-cases/commands/SupprimerUnLieuInclusion'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export async function supprimerUnLieuInclusionAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    const utilisateurId = await getSessionUtilisateurId()

    // Garde : suppression réservée aux bêta-testeurs.
    const contexte = await resoudreContexte(
      await new PrismaUtilisateurLoader().findById(utilisateurId),
      new PrismaMembreLoader()
    )
    if (!contexte.isBetaTesteur) {
      return ['Action réservée aux bêta-testeurs']
    }

    const utilisateurRepository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
    const utilisateur = await utilisateurRepository.get(utilisateurId)

    const loader = new PrismaRecupererLieuDetailsLoader()
    const lieuDetailsReadModel = await loader.recuperer(validationResult.data.lieuId)

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

    // Même règle de droits que la modification du lieu.
    const peutSupprimer = LieuInclusion.peutEtreModifiePar(
      utilisateur,
      lieuDetailsReadModel.codeDepartement,
      lieuDetailsReadModel.structureId,
      lieuDetailsReadModel.personnesTravaillant.length,
      departementsGouvernances
    )

    if (!peutSupprimer) {
      return ["Vous n'avez pas les droits pour supprimer ce lieu"]
    }

    const result = await new SupprimerUnLieuInclusion(new PrismaLieuInclusionRepository(), new Date()).handle({
      lieuId: validationResult.data.lieuId,
    })

    revalidatePath(validationResult.data.path)

    return [result]
  })
}

type ActionParams = Readonly<{
  lieuId: string
  path: string
}>

const validator = z.object({
  lieuId: z.string().min(1, { message: "L'identifiant du lieu doit être renseigné" }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
