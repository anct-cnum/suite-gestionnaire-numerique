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
      idAbsorbee: command.idAbsorbee,
      idSurvivante: command.idSurvivante,
      parUtilisateur: command.uidUtilisateur,
    })
  }
}

export interface StructureFusionRepository {
  fusionner(fusion: Fusion): ResultAsync<FusionFailure>
}

// La fusion = déplacer la TOTALITÉ des notions de l'absorbée vers la survivante puis soft-delete
// l'absorbée. On ne récupère JAMAIS les champs descriptifs de l'absorbée (dénomination, adresse, APE,
// catégorie juridique…) : la survivante garde les siens — importer ceux d'un doublon casserait la
// cohérence INSEE. Les identifiants d'identité (siret/ridet/rna) de l'absorbée sont abandonnés (loggés) ;
// les ids de source (coop/tp/ac) sont, eux, transférés (sinon le doublon ressuscite au resync).
export type Fusion = Readonly<{
  idAbsorbee: number
  idSurvivante: number
  parUtilisateur: string
}>

export type FusionFailure =
  | 'collisionIdentifiantSource'
  | 'collisionMembreGouvernance'
  | 'fusionEchouee'
  // Une canonique (INSEE) peut être absorbée par une autre canonique (doublons inter-SIRET), mais
  // jamais par une antenne : on ne fait pas disparaître une entité INSEE au profit d'une variante.
  | 'fusionImpossibleCanoniqueDansAntenne'
  | 'fusionImpossibleMemeStructure'
  | 'structureIntrouvable'

type Command = Readonly<{
  idAbsorbee: number
  idSurvivante: number
  uidUtilisateur: string
}>
