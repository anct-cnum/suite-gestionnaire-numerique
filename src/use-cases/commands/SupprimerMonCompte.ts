import { CommandHandler, ResultAsync } from './CommandHandler'

export class SupprimerMonCompte implements CommandHandler<EmailUtilisateur, ErreurSuppressionCompte> {
  readonly #suppressionUtilisateurGateway: SuppressionUtilisateurGateway

  constructor(suppressionUtilisateurGateway: SuppressionUtilisateurGateway) {
    this.#suppressionUtilisateurGateway = suppressionUtilisateurGateway
  }

  async execute(command: EmailUtilisateur): ResultAsync<ErreurSuppressionCompte> {
    return this.#suppressionUtilisateurGateway
      .delete(command)
      .then((result) => (result ? 'OK' : 'compteInexistant'))
  }
}

export interface SuppressionUtilisateurGateway {
  delete: (email: string) => Promise<boolean>
}

export type EmailUtilisateur = string

export type ErreurSuppressionCompte = 'compteInexistant'
