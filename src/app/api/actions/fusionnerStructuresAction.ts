'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Administrateur } from '@/domain/Administrateur'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaStructureFusionRepository } from '@/gateways/PrismaStructureFusionRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { FusionFailure, FusionnerStructures } from '@/use-cases/commands/FusionnerStructures'

const MESSAGES_ECHEC: Readonly<Record<FusionFailure, string>> = {
  fusionEchouee: 'La fusion a échoué, aucune modification effectuée',
  fusionImpossibleMemeStructure: 'Impossible de fusionner une structure avec elle-même',
  structureIntrouvable: 'Structure introuvable ou déjà supprimée',
}

export async function fusionnerStructuresAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)
  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  // Garde : seul un administrateur_dispositif peut fusionner des structures.
  const sub = await getSessionSub()
  const utilisateur = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).get(sub)
  if (!(utilisateur instanceof Administrateur)) {
    return ['Action réservée aux administrateurs']
  }

  // Fusion séquentielle : chaque absorbée est fusionnée dans la (même) survivante, une transaction
  // par paire. Non atomique entre paires — en cas d'échec partiel, les fusions déjà faites sont
  // conservées (réversibles via le journal d'audit) et les échecs sont remontés.
  const fusionnerStructures = new FusionnerStructures(new PrismaStructureFusionRepository())
  const echecs: Array<string> = []
  for (const idAbsorbee of actionParams.idsAbsorbees) {
    const result = await fusionnerStructures.handle({
      champsRetenus: {
        denominationAntenne: actionParams.denominationAntenne,
        denominationSirene: actionParams.denominationSirene,
      },
      idAbsorbee,
      idSurvivante: actionParams.idSurvivante,
      uidUtilisateur: sub,
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
}

type ActionParams = Readonly<{
  denominationAntenne?: null | string
  denominationSirene?: null | string
  idsAbsorbees: ReadonlyArray<number>
  idSurvivante: number
  path: string
}>

const validator = z.object({
  denominationAntenne: z.string().nullish(),
  denominationSirene: z.string().nullish(),
  idsAbsorbees: z
    .array(z.number().int().positive())
    .min(1, { message: 'Sélectionnez au moins une structure à fusionner' }),
  idSurvivante: z
    .number()
    .int()
    .positive({ message: "L'identifiant de la structure survivante doit être un entier positif" }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
