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
import { ModifierUneAction } from '@/use-cases/commands/ModifierUneAction'

export async function modifierUneActionAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const actionCommand = {
    anneeDeDebut: actionParams.anneeDeDebut,
    anneeDeFin: actionParams.anneeDeFin ?? '',
    besoins: actionParams.besoins.map((besoin) => besoin),
    budgetGlobal: actionParams.budgetGlobal,
    coFinancements: actionParams.coFinancements.map((cofinancement) => ({
      membreId: cofinancement.coFinanceur,
      montant: Number(cofinancement.montant),
    })),
    contexte: actionParams.contexte,
    demandeDeSubvention: actionParams.demandeDeSubvention ? {
      beneficiaires: [],
      enveloppeFinancementId: actionParams.demandeDeSubvention.enveloppeId,
      subventionDemandee: actionParams.demandeDeSubvention.total,
      subventionEtp: actionParams.demandeDeSubvention.montantRh,
      subventionPrestation: actionParams.demandeDeSubvention.montantPrestation,
    } : undefined,
    description: actionParams.description,
    destinataires: actionParams.destinataires.map((destinataire) => destinataire),
    nom: actionParams.nom,
    porteurs: actionParams.porteurs,
    uid: actionParams.uid,
    uidEditeur: await getSessionSub(),
    uidFeuilleDeRoute: actionParams.feuilleDeRoute,
    uidGouvernance: actionParams.gouvernance,
    uidPorteurs: [...actionParams.porteurs],
  }
  
  const result = await new ModifierUneAction(
    new PrismaGouvernanceRepository(),
    new PrismaFeuilleDeRouteRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaActionRepository(),
    new PrismaTransactionRepository(),
    new PrismaDemandeDeSubventionRepository(),
    new PrismaCoFinancementRepository(),
    new Date()
  ).handle(actionCommand)

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
  uid: string
}>

const validator = ActionValidator