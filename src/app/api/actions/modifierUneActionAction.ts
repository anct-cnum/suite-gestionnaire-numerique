'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaActionRepository } from '@/gateways/PrismaActionRepository'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaTransactionRepository } from '@/gateways/PrismaTransactionRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierUneAction } from '@/use-cases/commands/ModifierUneAction'

export async function modifierUneActionAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new ModifierUneAction(
    new PrismaGouvernanceRepository(),
    new PrismaFeuilleDeRouteRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaActionRepository(),
    new PrismaTransactionRepository(),
    new Date()
  ).handle({
    anneeDeDebut: actionParams.anneeDeDebut,
    anneeDeFin: actionParams.anneeDeFin,
    besoins: actionParams.besoins,
    budgetGlobal: actionParams.budgetGlobal,
    contexte: actionParams.contexte,
    description: actionParams.description,
    nom: actionParams.nom,
    uid: actionParams.uid,
    uidEditeur: await getSessionSub(),
    uidFeuilleDeRoute: actionParams.feuilleDeRoute,
    uidGouvernance: actionParams.gouvernance,
    uidPorteurs: actionParams.porteurs,
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  anneeDeDebut: string
  anneeDeFin?: string
  besoins: ReadonlyArray<string>
  budgetGlobal: number
  contexte: string
  description: string
  feuilleDeRoute: string
  gouvernance: string
  nom: string
  path: string
  porteurs: ReadonlyArray<string>
  uid: string
}>

const validator = z.object({
  anneeDeDebut: z.string().min(1, { message: 'La date de début est obligatoire' }),
  anneeDeFin: z.string().nullish(),
  besoins: z.array(z.string()).min(1, { message: 'Au moins un besoin est obligatoire' }),
  contexte: z.string().min(1, { message: 'Le contexte est obligatoire' }),
  description: z.string().min(1, { message: 'La description est obligatoire' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
}).refine((data) => {
  if (data.anneeDeFin === undefined || data.anneeDeFin === '' || data.anneeDeFin === null) {return true}
  const dateDeDebut = new Date(data.anneeDeDebut)
  const dateDeFin = new Date(data.anneeDeFin)
  return dateDeFin > dateDeDebut
}, { message: 'La date de fin doit être supérieure à la date de début' })
