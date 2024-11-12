import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropUtilisateurByUidRepository } from './shared/UtilisateurRepository'
import { UtilisateurUid } from '@/domain/Utilisateur'

export class SupprimerMonCompte implements CommandHandler<Command, SuppressionCompteFailure> {
  readonly #repository: DropUtilisateurByUidRepository

  constructor(repository: DropUtilisateurByUidRepository) {
    this.#repository = repository
  }

  async execute({ utilisateurUid }: Command): ResultAsync<SuppressionCompteFailure> {
    return this.#repository
      .dropByUid(UtilisateurUid.from(utilisateurUid))
      .then((result) => (result ? 'OK' : 'compteInexistant'))
  }
}

export type SuppressionCompteFailure = 'compteInexistant'

type Command = Readonly<{
  utilisateurUid: string
}>
