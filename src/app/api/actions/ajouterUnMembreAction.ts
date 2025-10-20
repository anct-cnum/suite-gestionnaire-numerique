'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'
import { PrismaTransactionRepository } from '@/gateways/PrismaTransactionRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterUnMembre } from '@/use-cases/commands/AjouterUnMembre'

export async function ajouterUnMembreAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    // Vérifier si l'erreur concerne les données de l'entreprise
    const hasEntrepriseError = validationResult.error.issues.some(
      issue => issue.path[0] === 'entreprise'
    )

    if (hasEntrepriseError) {
      return ['Un problème est survenu en récupérant les informations de l\'entreprise. Contactez le support ANCT.']
    }

    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new AjouterUnMembre(
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaGouvernanceRepository(),
    new PrismaMembreRepository(),
    new PrismaStructureRepository(),
    new PrismaTransactionRepository()
  ).handle({
    contact: actionParams.contact,
    contactTechnique: actionParams.contactTechnique,
    entreprise: actionParams.entreprise,
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
  entreprise: Readonly<{
    adresse: string
    categorieJuridiqueCode: string
    categorieJuridiqueUniteLegale: string
    codeInsee: string
    codePostal: string
    commune: string
    nom: string
    nomVoie: string
    numeroVoie: string
    siret: string
  }>
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
    adresse: z.string().min(1, { message: 'L\'adresse doit être renseignée' }),
    categorieJuridiqueCode: z.string().optional(),
    categorieJuridiqueUniteLegale: z.string().min(1, { message: 'La catégorie juridique doit être renseignée' }),
    codeInsee: z.string().min(1, { message: 'Le code INSEE doit être renseigné' }),
    codePostal: z.string().min(1, { message: 'Le code postal doit être renseigné' }),
    commune: z.string().min(1, { message: 'La commune doit être renseignée' }),
    nom: z.string().min(1, { message: 'Le nom de l\'entreprise doit être renseigné' }),
    nomVoie: z.string().min(1, { message: 'Le nom de voie doit être renseigné' }),
    numeroVoie: z.string(),
    siret: z.string().min(1, { message: 'Le SIRET doit être renseigné' }),
  }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})