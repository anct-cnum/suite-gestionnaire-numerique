'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureFusionRepository } from '@/gateways/PrismaStructureFusionRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { FusionFailure, FusionnerStructures } from '@/use-cases/commands/FusionnerStructures'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

const MESSAGES_ECHEC: Readonly<Record<FusionFailure, string>> = {
  collisionIdentifiantSource:
    'Conflit d’identifiant de source (Idposte ou Aidants Connect) avec la survivante : tranchez-le avant de fusionner',
  collisionMembreGouvernance: 'La survivante est déjà membre d’une gouvernance de la structure absorbée',
  fusionEchouee: 'La fusion a échoué, aucune modification effectuée',
  fusionImpossibleCanoniqueDansAntenne:
    'Une structure canonique (INSEE) ne peut être absorbée que par une autre canonique, pas par une antenne',
  fusionImpossibleMemeStructure: 'Impossible de fusionner une structure avec elle-même',
  structureIntrouvable: 'Structure introuvable ou déjà supprimée',
}

export async function fusionnerStructuresAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    // Garde : la comparaison est visible par tout administrateur, mais seul un bêta-testeur peut fusionner.
    const utilisateurId = await getSessionUtilisateurId()
    const utilisateur = await new PrismaUtilisateurLoader().findById(utilisateurId)
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
      return ['Action réservée aux administrateurs autorisés']
    }

    // Fusion séquentielle : chaque absorbée est fusionnée dans la (même) survivante, une transaction
    // par paire. Non atomique entre paires — en cas d'échec partiel, les fusions déjà faites sont
    // conservées (réversibles via le journal d'audit) et les échecs sont remontés.
    const fusionnerStructures = new FusionnerStructures(new PrismaStructureFusionRepository())
    const echecs: Array<string> = []
    for (const idAbsorbee of actionParams.idsAbsorbees) {
      const result = await fusionnerStructures.handle({
        idAbsorbee,
        idSurvivante: actionParams.idSurvivante,
        uidUtilisateur: utilisateurId,
      })
      if (result !== 'OK') {
        echecs.push(`Structure ${idAbsorbee} : ${MESSAGES_ECHEC[result]}`)
      }
    }

    if (echecs.length > 0) {
      return echecs
    }

    revalidatePath(actionParams.path)

    return ['OK']
  })
}

type ActionParams = Readonly<{
  idsAbsorbees: ReadonlyArray<number>
  idSurvivante: number
  path: string
}>

const validator = z.object({
  idsAbsorbees: z
    .array(z.number().int().positive())
    .min(1, { message: 'Sélectionnez au moins une structure à fusionner' }),
  idSurvivante: z
    .number()
    .int()
    .positive({ message: "L'identifiant de la structure survivante doit être un entier positif" }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
