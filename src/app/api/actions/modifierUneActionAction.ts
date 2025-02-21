
export async function modifierUneActionAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _actionParams: ActionParams
): Promise<ReadonlyArray<string>> {
  return Promise.resolve(['OK'])
}

type ActionParams = Readonly<{
  anneeDeDebut: string
  anneeDeFin?: string
  porteur: string
  budgetGlobal: number
  contexte: string
  description: string
  temporalite: string
  nom: string
  destinataires: ReadonlyArray<string>
  uid: string
}>
