import { CommandHandler, ResultAsync } from './CommandHandler'

export class SupprimerMonCompte implements CommandHandler<UtilisateurUid, ErreurSuppressionCompte> {
  readonly #suppressionUtilisateurGateway: SuppressionUtilisateurGateway

  constructor(suppressionUtilisateurGateway: SuppressionUtilisateurGateway) {
    this.#suppressionUtilisateurGateway = suppressionUtilisateurGateway
  }

  async execute(command: UtilisateurUid): ResultAsync<ErreurSuppressionCompte> {
    return this.#suppressionUtilisateurGateway
      .delete(command)
      .then((result) => (result ? 'OK' : 'compteInexistant'))
  }
}

export interface SuppressionUtilisateurGateway {
  delete: (email: string) => Promise<boolean>
}

export type UtilisateurUid = string

export type ErreurSuppressionCompte = 'compteInexistant'
