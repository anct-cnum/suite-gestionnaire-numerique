import { CommandHandler, ResultAsync } from '../CommandHandler'

export class TransfererNotionsStructure implements CommandHandler<Command, TransfertNotionsFailure> {
  readonly #repository: StructureTransfertRepository

  constructor(repository: StructureTransfertRepository) {
    this.#repository = repository
  }

  async handle(command: Command): ResultAsync<TransfertNotionsFailure> {
    if (command.idSource === command.idCible) {
      return 'transfertImpossibleMemeStructure'
    }
    if (command.notions.length === 0) {
      return 'aucuneNotionSelectionnee'
    }

    return this.#repository.transfererNotions({
      idCible: command.idCible,
      idSource: command.idSource,
      notions: command.notions,
      parUtilisateur: command.uidUtilisateur,
    })
  }
}

export interface StructureTransfertRepository {
  transfererNotions(transfert: TransfertNotions): ResultAsync<TransfertNotionsFailure>
}

// Une des 6 notions transférables d'une structure_administrative vers une autre. Type canonique
// partagé : le presenter (affichage des concepts) et l'UI (cases à cocher) s'y réfèrent.
export type NotionCle = 'aidantsConnect' | 'contacts' | 'coop' | 'idposte' | 'lieuInclusion' | 'membre'

// Déplacement d'un sous-ensemble de notions de la source vers la cible. La source n'est supprimée
// (soft-delete) que si elle ne porte plus aucune notion après le transfert. La fusion est le cas
// particulier où l'on transfère les 6 notions (cf. étape 2c).
export type TransfertNotions = Readonly<{
  idCible: number
  idSource: number
  notions: ReadonlyArray<NotionCle>
  parUtilisateur: string
}>

export type TransfertNotionsFailure =
  | 'aucuneNotionSelectionnee'
  // Une notion source porte un id scalaire (coop/tp/ac) alors que la cible en a déjà un différent.
  | 'collisionIdentifiantSource'
  // La cible est déjà membre d'une gouvernance dont la source est aussi membre (double rattachement).
  | 'collisionMembreGouvernance'
  | 'structureIntrouvable'
  | 'transfertEchoue'
  | 'transfertImpossibleMemeStructure'

type Command = Readonly<{
  idCible: number
  idSource: number
  notions: ReadonlyArray<NotionCle>
  uidUtilisateur: string
}>
