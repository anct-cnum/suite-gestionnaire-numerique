'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaAppariementLieuRepository } from '@/gateways/PrismaAppariementLieuRepository'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { DeciderAppariementFailure, DeciderAppariementLieu } from '@/use-cases/commands/DeciderAppariementLieu'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

const MESSAGES_ECHEC: Readonly<Record<DeciderAppariementFailure, string>> = {
  appariementIntrouvable: 'Appariement introuvable ou déjà décidé',
}

export async function deciderAppariementLieuAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    // Garde : revue réservée aux administrateurs (ANCT), comme l'accès à la page.
    const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    if (!contexte.aCesRoles('administrateur_dispositif')) {
      return ['Action réservée aux administrateurs']
    }

    const { cartoRecordId, decision, lieuId, path } = validationResult.data
    // decide_par (varchar libre côté dataspace) : l'email identifie le relecteur de façon lisible
    // dans l'Entrepôt ; l'id utilisateur MIN est de toute façon tracé par la journalisation.
    const result = await new DeciderAppariementLieu(new PrismaAppariementLieuRepository(), new Date()).handle({
      cartoRecordId,
      decidePar: utilisateur.email,
      decision,
      lieuId,
    })

    if (result !== 'OK') {
      return [MESSAGES_ECHEC[result]]
    }

    revalidatePath(path)

    return ['OK']
  })
}

type ActionParams = Readonly<{
  cartoRecordId: string
  decision: string
  lieuId: number
  path: string
}>

const validator = z.object({
  cartoRecordId: z.string().min(1, { message: 'L’identifiant du record cartographie doit être renseigné' }),
  decision: z.enum(['valide', 'rejete'], { message: 'La décision doit être « valide » ou « rejete »' }),
  lieuId: z.number().int().positive({ message: 'L’identifiant du lieu doit être un entier positif' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
