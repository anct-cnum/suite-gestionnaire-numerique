'use server'

export async function ajouterUnComiteAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _actionParams: ActionParams
): Promise<void> {
  return Promise.resolve()
}

type ActionParams = Readonly<{
  gouvernanceId: string,
  type: string,
  frequence: string,
  date?: string,
  commentaire?: string
}>
