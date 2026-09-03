'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import prisma from '../../../../prisma/prismaClient'
import regions from '../../../../ressources/regions.json'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ChangerMaRegion } from '@/use-cases/commands/ChangerMaRegion'

export async function changerMaRegionAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)

    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    const message = await new ChangerMaRegion(new PrismaUtilisateurRepository(prisma.utilisateurRecord)).handle({
      nouveauCodeRegion: validationResult.data.nouveauCodeRegion,
      uidUtilisateurCourant: await getSessionUtilisateurId(),
    })

    revalidatePath(actionParams.path)

    return [message]
  })
}

type ActionParams = Readonly<{
  nouveauCodeRegion: string
  path: string
}>

// La pseudo-région « 00 - Autres territoires » est exclue : elle ne porte aucun département réel
const codesRegions = regions.filter((region) => region.code !== '00').map((region) => region.code) as [
  string,
  ...Array<string>,
]

const validator = z.object({
  nouveauCodeRegion: z.enum(codesRegions, { message: "Le code région n'est pas correct" }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
