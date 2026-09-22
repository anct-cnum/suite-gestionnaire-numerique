'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import PrismaAidantDetailsLoader from '@/gateways/AidantDetailsLoader'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaAidantRepository } from '@/gateways/PrismaAidantRepository'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { emailPattern, telephonePattern } from '@/shared/patterns'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export async function modifierInformationsPersonnellesAidantAction(
  actionParams: ActionParams
): Promise<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)

    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    const aidantResult = await new PrismaAidantDetailsLoader().findById(String(actionParams.aidantId))

    if ('type' in aidantResult) {
      return ["Une erreur est survenue. Les modifications n'ont pas été enregistrées. Veuillez réessayer."]
    }

    if (aidantResult.structureEmployeuseId !== null) {
      const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
      const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
      const codesDepartements =
        aidantResult.codeDepartementEmployeur !== null ? [aidantResult.codeDepartementEmployeur] : []
      if (!contexte.peutGererStructure(aidantResult.structureEmployeuseId, codesDepartements)) {
        return ["Vous n'avez pas les droits pour modifier les informations de cet aidant."]
      }
    }

    const emails = actionParams.emails
      .split(/[,;]/)
      .map((email) => email.trim())
      .filter(Boolean)

    const emailsInvalides = emails.some((email) => !emailPattern.test(email))
    if (emails.length === 0) {
      return ['Veuillez renseigner au moins une adresse électronique.']
    }
    if (emailsInvalides) {
      return ['Veuillez renseigner une adresse électronique valide.']
    }

    try {
      await new PrismaAidantRepository().modifierInformationsPersonnelles(
        actionParams.aidantId,
        {
          emails,
          nom: actionParams.nom,
          prenom: actionParams.prenom,
          telephone: actionParams.telephone,
        },
        new Date()
      )
    } catch {
      return ["Une erreur est survenue. Les modifications n'ont pas été enregistrées. Veuillez réessayer."]
    }

    revalidatePath(actionParams.path)

    return ['OK']
  })
}

type ActionParams = Readonly<{
  aidantId: number
  emails: string
  nom: string
  path: string
  prenom: string
  telephone: string
}>

const validator = z.object({
  aidantId: z.number().int().positive({ message: 'Identifiant invalide' }),
  nom: z.string().min(1, { message: 'Ce champ est obligatoire.' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  prenom: z.string().min(1, { message: 'Ce champ est obligatoire.' }),
  telephone: z
    .string()
    .regex(telephonePattern, { message: 'Veuillez renseigner un numéro de téléphone valide.' })
    .or(z.literal('')),
})
