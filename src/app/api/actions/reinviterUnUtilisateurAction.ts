'use server'

import { revalidatePath } from 'next/cache'
import { z, ZodIssue } from 'zod'

import { ResultAsync } from '@/use-cases/CommandHandler'

export async function reinviterUnUtilisateurAction(actionParams: ActionParams): ResultAsync<string | Array<ZodIssue>> {
  const reinviterUnUtilisateurResult = validator
    .safeParse({
      email: actionParams.email,
    })

  if (reinviterUnUtilisateurResult.error) {
    return reinviterUnUtilisateurResult.error.issues
  }

  revalidatePath('/mes-utilisateurs')
  return Promise.resolve('OK')
}

type ActionParams = Readonly<{
  email: string
}>

const validator = z
  .object({
    email: z.string().email({ message: 'L’e-mail doit être valide' }),
  })
