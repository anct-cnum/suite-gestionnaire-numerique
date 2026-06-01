import { CommandHandler, ResultAsync } from '../CommandHandler'

export class FusionnerStructures implements CommandHandler<Command, FusionFailure> {
  readonly #repository: StructureFusionRepository

  constructor(repository: StructureFusionRepository) {
    this.#repository = repository
  }

  async handle(command: Command): ResultAsync<FusionFailure> {
    if (command.idSurvivante === command.idAbsorbee) {
      return 'fusionImpossibleMemeStructure'
    }

    return this.#repository.fusionner({
      champsRetenus: command.champsRetenus,
      idAbsorbee: command.idAbsorbee,
      idSurvivante: command.idSurvivante,
      parUtilisateur: command.uidUtilisateur,
    })
  }
}

export interface StructureFusionRepository {
  fusionner(fusion: Fusion): ResultAsync<FusionFailure>
}

export type Fusion = Readonly<{
  champsRetenus: ChampsRetenus
  idAbsorbee: number
  idSurvivante: number
  parUtilisateur: string
}>

// Champs informatifs que l'admin peut explicitement arbitrer côté survivante.
// Les autres champs sont fusionnés automatiquement en COALESCE(survivante, absorbée).
// Les identifiants UNIQUE (siret, ridet, coop_id, ac_id, tp_id) ne sont JAMAIS
// transférés : la survivante conserve les siens, ceux de l'absorbée sont consignés
// dans le journal d'audit (`moved_identifiers`) puis perdus.
export type ChampsRetenus = Readonly<{
  adresseId?: null | number
  denominationAntenne?: null | string
  denominationSirene?: null | string
}>

export type FusionFailure = 'fusionEchouee' | 'fusionImpossibleMemeStructure' | 'structureIntrouvable'

type Command = Readonly<{
  champsRetenus: ChampsRetenus
  idAbsorbee: number
  idSurvivante: number
  uidUtilisateur: string
}>
