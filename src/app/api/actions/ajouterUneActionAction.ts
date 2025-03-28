export async function ajouterUneActionAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _actionParams: ActionParams
): Promise<ReadonlyArray<string>> {
  return Promise.resolve(['OK'])
}

type ActionParams = Readonly<{
  anneeDeDebut: string
  anneeDeFin?: string
  budgetGlobal: number
  budgetPrevisionnel: ReadonlyArray<{
    coFinanceur: string
    montant: string
  }>
  contexte: string
  description: string
  destinataires: ReadonlyArray<string>
  nom: string
  porteur: string
  temporalite: string
}>
