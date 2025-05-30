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
import { PrismaTransactionRepository } from '@/gateways/PrismaTransactionRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { Enveloppe } from '@/presenters/shared/enveloppe'
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
      enveloppeFinancementId: actionCommand.demandeDeSubvention.enveloppe.value,
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
    enveloppe: Enveloppe
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

const validator = z.object({
  anneeDeDebut: z.string().min(1, { message: 'La date de début est obligatoire' }),
  anneeDeFin: z.string().nullish(),
  besoins: z.array(z.string()).min(1, { message: 'Au moins un besoin est obligatoire' }),
  contexte: z.string().min(1, { message: 'Le contexte est obligatoire' }),
  demandeDeSubvention: z.object({
    enveloppe: z.object({
      budget: z.number(),
      isSelected: z.boolean(),
      label: z.string(),
      value: z.string(),
    }).nullish(),
    montantPrestation: z.number().nullish(),
    montantRh: z.number().nullish(),
    total: z.number().nullish(),
  }).nullish(),
  description: z.string().min(1, { message: 'La description est obligatoire' }),
  destinataires: z.array(z.string()).nullish(),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
}).refine((data) => {
  if (data.anneeDeFin === undefined || data.anneeDeFin === '' || data.anneeDeFin === null) {return true}
  const dateDeDebut = new Date(data.anneeDeDebut)
  const dateDeFin = new Date(data.anneeDeFin)
  return dateDeFin > dateDeDebut
}, { message: 'La date de fin doit être supérieure à la date de début' }).refine((data) => {
  if (data.demandeDeSubvention === undefined || data.demandeDeSubvention === null) {return true}
  return data.destinataires?.length !== 0
}, { message: 'La liste des destinataires de la demande de subvention doit être non vide' })
