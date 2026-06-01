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

  const result = await new FusionnerStructures(new PrismaStructureFusionRepository()).handle({
    champsRetenus: {
      denominationAntenne: actionParams.denominationAntenne,
      denominationSirene: actionParams.denominationSirene,
    },
    idAbsorbee: actionParams.idAbsorbee,
    idSurvivante: actionParams.idSurvivante,
    uidUtilisateur: sub,
  })

  if (result !== 'OK') {
    return [MESSAGES_ECHEC[result]]
  }

  revalidatePath(actionParams.path)

  return ['OK']
}

type ActionParams = Readonly<{
  denominationAntenne?: null | string
  denominationSirene?: null | string
  idAbsorbee: number
  idSurvivante: number
  path: string
}>

const validator = z.object({
  denominationAntenne: z.string().nullish(),
  denominationSirene: z.string().nullish(),
  idAbsorbee: z
    .number()
    .int()
    .positive({ message: "L'identifiant de la structure absorbée doit être un entier positif" }),
  idSurvivante: z
    .number()
    .int()
    .positive({ message: "L'identifiant de la structure survivante doit être un entier positif" }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
