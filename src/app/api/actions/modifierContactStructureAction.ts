'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'
import { emailPattern, telephonePattern } from '@/shared/patterns'

export async function modifierContactStructureAction(
  actionParams: ActionParams
): Promise<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  await new PrismaStructureRepository().modifierContact(actionParams.contactId, {
    email: actionParams.email,
    estReferentFNE: actionParams.estReferentFNE,
    fonction: actionParams.fonction,
    nom: actionParams.nom,
    prenom: actionParams.prenom,
    telephone: actionParams.telephone,
  })

  revalidatePath(actionParams.path)

  return ['OK']
}

type ActionParams = Readonly<{
  contactId: number
  email: string
  estReferentFNE: boolean
  fonction: string
  nom: string
  path: string
  prenom: string
  structureId: number
  telephone: string
}>

const validator = z.object({
  contactId: z.number().int().positive({ message: 'L\'identifiant du contact doit être un entier positif' }),
  email: z.string().regex(emailPattern, { message: 'L\'adresse électronique doit être valide' }),
  estReferentFNE: z.boolean(),
  fonction: z.string().min(1, { message: 'La fonction doit être renseignée' }),
  nom: z.string().min(1, { message: 'Le nom doit être renseigné' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  prenom: z.string().min(1, { message: 'Le prénom doit être renseigné' }),
  structureId: z.number().int().positive({ message: 'L\'identifiant de la structure doit être un entier positif' }),
  telephone: z.string().regex(telephonePattern, { message: 'Le téléphone doit être au format 0102030405 ou +33102030405' }).or(z.literal('')),
})
