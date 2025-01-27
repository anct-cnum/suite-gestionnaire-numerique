'use server'

import { revalidatePath } from 'next/cache'

export async function modifierUneNoteDeContexteAction(): Promise<Array<string>> {
  revalidatePath('/gouvernance/11')
  return Promise.resolve(['OK'])
}
