import { CommandHandler, ResultAsync } from './CommandHandler'

export class SupprimerMonCompteCommandHandler implements CommandHandler<EmailUtilisateur, ErreurSuppressionCompte> {
  readonly #gateway: SuppressionUtilisateurGateway

  constructor(gateway: SuppressionUtilisateurGateway) {
    this.#gateway = gateway
  }

  async execute(command: EmailUtilisateur): ResultAsync<ErreurSuppressionCompte> {
    return this.#gateway.delete(command).then((result) => (result ? 'OK' : 'compteInexistant'))
  }
}

export interface SuppressionUtilisateurGateway {
  delete: (email: string) => Promise<boolean>
}

export type EmailUtilisateur = string

type ErreurSuppressionCompte = 'compteInexistant'
