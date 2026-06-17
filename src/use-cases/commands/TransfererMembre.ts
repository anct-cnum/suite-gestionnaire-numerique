import { CommandHandler, ResultAsync } from '../CommandHandler'

export class TransfererMembre implements CommandHandler<Command, TransfertFailure> {
  readonly #repository: MembreTransfertRepository

  constructor(repository: MembreTransfertRepository) {
    this.#repository = repository
  }

  async handle(command: Command): ResultAsync<TransfertFailure> {
    if (command.idSource === command.idCible) {
      return 'transfertImpossibleMemeStructure'
    }

    return this.#repository.transferer({
      idCible: command.idCible,
      idMembre: command.idMembre,
      idSource: command.idSource,
      parUtilisateur: command.uidUtilisateur,
    })
  }
}

export interface MembreTransfertRepository {
  transferer(transfert: Transfert): ResultAsync<TransfertFailure>
}

// Transfert d'UN membre + ses utilisateurs + ses contacts de la structure source vers la cible.
// La source n'est jamais supprimée (contrairement à la fusion) : elle reste une structure légitime.
export type Transfert = Readonly<{
  idCible: number
  idMembre: string
  idSource: number
  parUtilisateur: string
}>

export type TransfertFailure =
  | 'membreIntrouvable'
  | 'structureIntrouvable'
  | 'transfertCreeraitDoublonMembre'
  | 'transfertEchoue'
  | 'transfertImpossibleMemeStructure'

type Command = Readonly<{
  idCible: number
  idMembre: string
  idSource: number
  uidUtilisateur: string
}>
