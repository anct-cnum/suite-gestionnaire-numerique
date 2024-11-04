import { CommandHandler, ResultAsync } from '../CommandHandler'

export class SupprimerMonCompte implements CommandHandler<Command, SuppressionCompteFailure> {
  readonly #suppressionUtilisateurGateway: SuppressionUtilisateurGateway

  constructor(suppressionUtilisateurGateway: SuppressionUtilisateurGateway) {
    this.#suppressionUtilisateurGateway = suppressionUtilisateurGateway
  }

  async execute({ utilisateurUid }: Command): ResultAsync<SuppressionCompteFailure> {
    return this.#suppressionUtilisateurGateway
      .delete(utilisateurUid)
      .then((result) => (result ? 'OK' : 'compteInexistant'))
  }
}

export interface SuppressionUtilisateurGateway {
  delete: (uid: string) => Promise<boolean>
}

export type SuppressionCompteFailure = 'compteInexistant'

type Command = Readonly<{
  utilisateurUid: string
}>
