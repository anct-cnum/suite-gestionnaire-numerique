'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { PrismaStructureCandidatureLoader } from '@/gateways/PrismaStructureCandidatureLoader'
import { PrismaTransactionRepository } from '@/gateways/PrismaTransactionRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { RejoindreUneGouvernance } from '@/use-cases/commands/RejoindreUneGouvernance'

export async function rejoindreUneGouvernanceAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
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
    contact: actionParams.contact,
    contactTechnique: actionParams.contactTechnique,
    uidUtilisateur: await getSessionSub(),
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  codeDepartement: string
  contact: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
  }>
  contactTechnique?: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
  }>
  path: string
}>

const validator = z.object({
  codeDepartement: z.string().min(1, { message: 'Le département doit être renseigné' }),
  contact: z.object({
    email: z.string().email({ message: "L'email doit être valide" }),
    fonction: z.string().min(1, { message: 'La fonction du contact doit être renseignée' }),
    nom: z.string().min(1, { message: 'Le nom du contact doit être renseigné' }),
    prenom: z.string().min(1, { message: 'Le prénom du contact doit être renseigné' }),
  }),
  contactTechnique: z
    .object({
      email: z.string().email({ message: "L'email du contact secondaire doit être valide" }),
      fonction: z.string().min(1, { message: 'La fonction du contact secondaire doit être renseignée' }),
      nom: z.string().min(1, { message: 'Le nom du contact secondaire doit être renseigné' }),
      prenom: z.string().min(1, { message: 'Le prénom du contact secondaire doit être renseigné' }),
    })
    .optional(),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
