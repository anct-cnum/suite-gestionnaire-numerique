'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import prisma from '../../../../prisma/prismaClient'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { PrismaStructureCandidatureLoader } from '@/gateways/PrismaStructureCandidatureLoader'
import { PrismaTransactionRepository } from '@/gateways/PrismaTransactionRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { RejoindreUneGouvernance } from '@/use-cases/commands/RejoindreUneGouvernance'
import { ChoixContactData } from '@/use-cases/commands/shared/MembreRepository'

export async function rejoindreUneGouvernanceAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)

    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    const result = await new RejoindreUneGouvernance(
      new PrismaUtilisateurRepository(prisma.utilisateurRecord),
      new PrismaGouvernanceRepository(),
      new PrismaMembreRepository(),
      new PrismaMembreLoader(),
      new PrismaStructureCandidatureLoader(),
      new PrismaTransactionRepository()
    ).handle({
      codeDepartement: actionParams.codeDepartement,
      contact: versChoixContactData(actionParams.contact),
      contactTechnique: actionParams.contactTechnique ? versChoixContactData(actionParams.contactTechnique) : undefined,
      uidUtilisateur: await getSessionUtilisateurId(),
    })

    revalidatePath(validationResult.data.path)

    return [result]
  })
}

type ChoixContactAction =
  | Readonly<{ contactExistantId: number; type: 'existant' }>
  | Readonly<{ email: string; fonction: string; nom: string; prenom: string; type: 'nouveau' }>

function versChoixContactData(choix: ChoixContactAction): ChoixContactData {
  if (choix.type === 'existant') {
    return { contactExistantId: choix.contactExistantId, type: 'existant' }
  }
  return {
    donnees: { email: choix.email, fonction: choix.fonction, nom: choix.nom, prenom: choix.prenom },
    type: 'nouveau',
  }
}

type ActionParams = Readonly<{
  codeDepartement: string
  contact: ChoixContactAction
  contactTechnique?: ChoixContactAction
  path: string
}>

const choixContactSchema = z.discriminatedUnion('type', [
  z.object({
    contactExistantId: z.number({ message: "L'identifiant du contact doit être un nombre" }),
    type: z.literal('existant'),
  }),
  z.object({
    email: z.string().email({ message: "L'email doit être valide" }),
    fonction: z.string().min(1, { message: 'La fonction du contact doit être renseignée' }),
    nom: z.string().min(1, { message: 'Le nom du contact doit être renseigné' }),
    prenom: z.string().min(1, { message: 'Le prénom du contact doit être renseigné' }),
    type: z.literal('nouveau'),
  }),
])

const validator = z.object({
  codeDepartement: z.string().min(1, { message: 'Le département doit être renseigné' }),
  contact: choixContactSchema,
  contactTechnique: choixContactSchema.optional(),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
