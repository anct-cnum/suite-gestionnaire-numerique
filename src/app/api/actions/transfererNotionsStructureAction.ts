'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Administrateur } from '@/domain/Administrateur'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaStructureTransfertRepository } from '@/gateways/PrismaStructureTransfertRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import {
  NotionCle,
  TransfererNotionsStructure,
  TransfertNotionsFailure,
} from '@/use-cases/commands/TransfererNotionsStructure'

const MESSAGES_ECHEC: Readonly<Record<TransfertNotionsFailure, string>> = {
  aucuneNotionSelectionnee: 'Sélectionnez au moins une notion à transférer',
  collisionIdentifiantSource:
    'Un identifiant source (Coop, Idposte ou Aidants Connect) entre en collision avec la structure cible',
  collisionMembreGouvernance: 'La structure cible est déjà membre d’une gouvernance de la structure source',
  structureIntrouvable: 'Structure introuvable ou déjà supprimée',
  transfertEchoue: 'Le transfert a échoué, aucune modification effectuée',
  transfertImpossibleMemeStructure: 'La structure source et la structure cible sont identiques',
}

export async function transfererNotionsStructureAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)
  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  // Garde : seul un administrateur_dispositif porteur du flag beta testeur peut transférer.
  const sub = await getSessionSub()
  const utilisateur = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).get(sub)
  if (!(utilisateur instanceof Administrateur) || !utilisateur.isBetaTesteur) {
    return ['Action réservée aux administrateurs autorisés']
  }

  const result = await new TransfererNotionsStructure(new PrismaStructureTransfertRepository()).handle({
    idCible: actionParams.idCible,
    idSource: actionParams.idSource,
    notions: actionParams.notions,
    uidUtilisateur: sub,
  })

  if (result !== 'OK') {
    return [MESSAGES_ECHEC[result]]
  }

  revalidatePath(actionParams.path)

  return ['OK']
}

type ActionParams = Readonly<{
  idCible: number
  idSource: number
  notions: ReadonlyArray<NotionCle>
  path: string
}>

// Les valeurs doivent rester alignées sur le type NotionCle (use-case TransfererNotionsStructure).
const validator = z.object({
  idCible: z.number().int().positive({ message: 'La structure cible doit être un entier positif' }),
  idSource: z.number().int().positive({ message: 'La structure source doit être un entier positif' }),
  notions: z
    .array(z.enum(['aidantsConnect', 'contacts', 'coop', 'idposte', 'lieuInclusion', 'membre']))
    .min(1, { message: 'Sélectionnez au moins une notion à transférer' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
