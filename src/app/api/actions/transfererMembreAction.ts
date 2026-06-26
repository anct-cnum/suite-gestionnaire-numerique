'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaMembreTransfertRepository } from '@/gateways/PrismaMembreTransfertRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { TransfererMembre, TransfertFailure } from '@/use-cases/commands/TransfererMembre'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

const MESSAGES_ECHEC: Readonly<Record<TransfertFailure, string>> = {
  membreIntrouvable: 'Membre introuvable sur la structure d’origine',
  structureIntrouvable: 'Structure introuvable ou déjà supprimée',
  transfertCreeraitDoublonMembre: 'La structure cible est déjà membre de cette gouvernance',
  transfertEchoue: 'Le transfert a échoué, aucune modification effectuée',
  transfertImpossibleMemeStructure: 'La structure d’origine et la structure cible sont identiques',
}

export async function transfererMembreAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)
  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  // Garde : seul un bêta-testeur peut transférer.
  const sub = await getSessionSub()
  const utilisateur = await new PrismaUtilisateurLoader().findByUid(sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
    return ['Action réservée aux administrateurs autorisés']
  }

  const result = await new TransfererMembre(new PrismaMembreTransfertRepository()).handle({
    idCible: actionParams.idCible,
    idMembre: actionParams.idMembre,
    idSource: actionParams.idSource,
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
  idMembre: string
  idSource: number
  path: string
}>

const validator = z.object({
  idCible: z.number().int().positive({ message: 'La structure cible doit être un entier positif' }),
  idMembre: z.string().min(1, { message: 'Le membre doit être renseigné' }),
  idSource: z.number().int().positive({ message: 'La structure d’origine doit être un entier positif' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
