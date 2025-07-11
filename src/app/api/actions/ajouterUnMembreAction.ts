'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterUnMembre } from '@/use-cases/commands/AjouterUnMembre'

export async function ajouterUnMembreAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new AjouterUnMembre(
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaGouvernanceRepository(),
    new PrismaMembreRepository()
  ).handle({
    contact: actionParams.contact,
    contactTechnique: actionParams.contactTechnique,
    entreprise: actionParams.entreprise,
    nomEntreprise: actionParams.nomEntreprise,
    uidGestionnaire: await getSessionSub(),
    uidGouvernance: actionParams.codeDepartement, // Pour l'instant, on utilise le code département
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
  entreprise?: Readonly<{
    categorieJuridiqueCode: string
    categorieJuridiqueUniteLegale: string
    siret: string
  }>
  nomEntreprise: string
  path: string
}>

const validator = z.object({
  codeDepartement: z.string().min(1, { message: 'Le code département doit être renseigné' }),
  contact: z.object({
    email: z.string().email({ message: 'L\'email doit être valide' }),
    fonction: z.string().min(1, { message: 'La fonction du contact doit être renseignée' }),
    nom: z.string().min(1, { message: 'Le nom du contact doit être renseigné' }),
    prenom: z.string().min(1, { message: 'Le prénom du contact doit être renseigné' }),
  }),
  contactTechnique: z.object({
    email: z.string().email({ message: 'L\'email du contact technique doit être valide' }),
    fonction: z.string().min(1, { message: 'La fonction du contact technique doit être renseignée' }),
    nom: z.string().min(1, { message: 'Le nom du contact technique doit être renseigné' }),
    prenom: z.string().min(1, { message: 'Le prénom du contact technique doit être renseigné' }),
  }).optional(),
  entreprise: z.object({
    categorieJuridiqueUniteLegale: z.string().min(1, { message: 'La catégorie juridique doit être renseignée' }),
    siret: z.string().min(1, { message: 'Le SIRET doit être renseigné' }),
  }).optional(),
  nomEntreprise: z.string().min(1, { message: 'Le nom de l\'entreprise doit être renseigné' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})