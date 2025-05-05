'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaActionRepository } from '@/gateways/PrismaActionRepository'
import { PrismaCoFinancementRepository } from '@/gateways/PrismaCoFinancementRepository'
import { PrismaDemandeDeSubventionRepository } from '@/gateways/PrismaDemandeDeSubventionRepository'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaMembreDepartementRepository } from '@/gateways/PrismaMembreDepartementRepository'
import { PrismaTransactionRepository } from '@/gateways/PrismaTransactionRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterUneAction } from '@/use-cases/commands/AjouterUneAction'

export async function ajouterUneActionAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const actionCommand = {
    anneeDeDebut: actionParams.anneeDeDebut,
    anneeDeFin: actionParams.anneeDeFin,
    budgetGlobal: actionParams.budgetGlobal,
    budgetPrevisionnel: actionParams.budgetPrevisionnel,
    contexte: actionParams.contexte,
    description: actionParams.description,
    destinataires: actionParams.destinataires,
    feuilleDeRoute: actionParams.feuilleDeRoute,
    gouvernance: actionParams.gouvernance,
    nom: actionParams.nom,
    porteurs: actionParams.porteurs,
    temporalite: actionParams.temporalite,
  }

  const command = {
    beneficiaires: actionCommand.destinataires.map((destinataire) => destinataire),
    besoins: ['etablir_diagnostic_territorial'], 
    budgetGlobal: actionCommand.budgetGlobal,
    coFinancements: [],
    contexte: actionCommand.contexte,
    dateDeDebut: actionCommand.anneeDeDebut,
    dateDeFin: actionCommand.anneeDeFin ?? '',
    description: actionCommand.description, 
    nom: actionCommand.nom,
    uidEditeur: await getSessionSub(),
    uidFeuilleDeRoute: actionParams.feuilleDeRoute,
    uidGouvernance: actionParams.gouvernance,
    uidPorteur: actionParams.porteurs[0], 
  }
  
  const result = await new AjouterUneAction(
    new PrismaGouvernanceRepository(),
    new PrismaFeuilleDeRouteRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaActionRepository(),
    new PrismaDemandeDeSubventionRepository(),
    new PrismaCoFinancementRepository(),
    new PrismaMembreDepartementRepository(),
    new PrismaTransactionRepository(),
    new Date()
  ).handle(command)
  
  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  anneeDeDebut: string
  anneeDeFin?: string
  budgetGlobal: number
  budgetPrevisionnel: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  contexte: string
  description: string
  destinataires: ReadonlyArray<string>
  feuilleDeRoute: string
  gouvernance: string
  nom: string
  path: string
  porteurs: ReadonlyArray<string>
  temporalite: string
}>

const validator = z.object({
  contexte: z.string().min(1, { message: 'Le contexte est obligatoire' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),

})