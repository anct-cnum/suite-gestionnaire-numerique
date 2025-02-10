'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { ResultAsync } from '@/use-cases/CommandHandler'

export async function accepterUnMembreAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  // const result = await new AccepterUnMembre(
  //   new PrismaUtilisateurRepository(prisma.utilisateurRecord),
  //   new PrismaGouvernanceRepository(prisma.gouvernanceRecord),
  //   new PrismaMembreRepository(prisma.membreRecord),
  // ).handle({
  //   uidMembreInvalide: actionParams.uidMembreInvalide,
  //   uidGestionnaire: await getSessionSub(),
  //   uidGouvernance: actionParams.uidGouvernance,
  // })

  revalidatePath(validationResult.data.path)

  return ['OK']
}

type ActionParams = Readonly<{
  path: string
  uidGouvernance: string
  uidMembreInvalide: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
