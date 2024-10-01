import { CommandHandler, ResultAsync } from '../CommandHandler'

export class SupprimerMonCompte implements CommandHandler<UtilisateurUid, SuppressionCompteFailure> {
  readonly #suppressionUtilisateurGateway: SuppressionUtilisateurGateway

  constructor(suppressionUtilisateurGateway: SuppressionUtilisateurGateway) {
    this.#suppressionUtilisateurGateway = suppressionUtilisateurGateway
  }

  async execute(command: UtilisateurUid): ResultAsync<SuppressionCompteFailure> {
    return this.#suppressionUtilisateurGateway
      .delete(command)
      .then((result) => (result ? 'OK' : 'compteInexistant'))
  }
}

export interface SuppressionUtilisateurGateway {
  delete: (uid: UtilisateurUid) => Promise<boolean>
}

export type UtilisateurUid = string

export type SuppressionCompteFailure = 'compteInexistant'
