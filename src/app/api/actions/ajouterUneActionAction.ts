'use server'

import { revalidatePath } from 'next/cache'

import { ActionValidator } from './shared/action'
import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaActionRepository } from '@/gateways/PrismaActionRepository'
import { PrismaCoFinancementRepository } from '@/gateways/PrismaCoFinancementRepository'
import { PrismaDemandeDeSubventionRepository } from '@/gateways/PrismaDemandeDeSubventionRepository'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaTransactionRepository } from '@/gateways/PrismaTransactionRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterUneAction } from '@/use-cases/commands/AjouterUneAction'

export async function ajouterUneActionAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)
  if (!validationResult.success) {
    return validationResult.error.issues.map(({ message }: { message: string }) => message)
  }

  const actionCommand = {
    anneeDeDebut: actionParams.anneeDeDebut,
    anneeDeFin: actionParams.anneeDeFin,
    besoins: actionParams.besoins,
    budgetGlobal: actionParams.budgetGlobal,
    budgetPrevisionnel: actionParams.coFinancements,
    coFinancements: actionParams.coFinancements,
    contexte: actionParams.contexte,
    demandeDeSubvention: actionParams.demandeDeSubvention,
    description: actionParams.description,
    destinataires: actionParams.destinataires,
    feuilleDeRoute: actionParams.feuilleDeRoute,
    gouvernance: actionParams.gouvernance,
    nom: actionParams.nom,
    porteurs: actionParams.porteurs,
  }
  const command = {
    besoins: actionCommand.besoins.map((besoin) => besoin),
    budgetGlobal: actionCommand.budgetGlobal,
    coFinancements: actionCommand.coFinancements.map((cofinancement) => ({
      membreId: cofinancement.coFinanceur,
      montant: Number(cofinancement.montant),
    })),
    contexte: actionCommand.contexte,
    dateDeDebut: actionCommand.anneeDeDebut,
    dateDeFin: actionCommand.anneeDeFin ?? '',
    demandesDeSubvention: actionCommand.demandeDeSubvention ? [{
      beneficiaires: [],
      enveloppeFinancementId: actionCommand.demandeDeSubvention.enveloppeId,
      statut: 'deposee',
      subventionDemandee: actionCommand.demandeDeSubvention.total,
      subventionEtp: actionCommand.demandeDeSubvention.montantRh,
      subventionPrestation: actionCommand.demandeDeSubvention.montantPrestation,
    }] : undefined,
    description: actionCommand.description,
    destinataires: actionCommand.destinataires.map((destinataire) => destinataire),
    nom: actionCommand.nom,
    uidEditeur: await getSessionSub(),
    uidFeuilleDeRoute: actionParams.feuilleDeRoute,
    uidGouvernance: actionParams.gouvernance,
    uidPorteurs: [...actionParams.porteurs],
  }

  const result = await new AjouterUneAction(
    new PrismaGouvernanceRepository(),
    new PrismaFeuilleDeRouteRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaActionRepository(),
    new PrismaDemandeDeSubventionRepository(),
    new PrismaCoFinancementRepository(),
    new PrismaTransactionRepository(),
    new Date()
  ).handle(command)

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  anneeDeDebut: string
  anneeDeFin?: string
  besoins: ReadonlyArray<string>
  budgetGlobal: number
  coFinancements: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  contexte: string
  demandeDeSubvention?: Readonly<{
    enveloppeId: string
    montantPrestation: number
    montantRh: number
    total: number
  }>
  description: string
  destinataires: ReadonlyArray<string>
  feuilleDeRoute: string
  gouvernance: string
  nom: string
  path: string
  porteurs: ReadonlyArray<string>
}>

const validator = ActionValidator