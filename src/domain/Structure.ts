import { Entity, Uid } from './shared/Model'

export class Structure extends Entity<StructureState> {
  override get state(): StructureState {
    return {
      departementCode: this.#departementCode,
      identifiantEtablissement: this.#identifiantEtablissement,
      nom: this.#nom,
      uid: this.uid.state,
    }
  }

  readonly #departementCode: string
  readonly #identifiantEtablissement: string
  readonly #nom: string

  private constructor(
    uid: StructureUid,
    nom: string,
    identifiantEtablissement: string,
    departementCode: string
  ) {
    super(uid)
    this.#nom = nom
    this.#identifiantEtablissement = identifiantEtablissement
    this.#departementCode = departementCode
  }

  static create({
    departementCode,
    identifiantEtablissement,
    nom,
    uid,
  }: StructureFactoryParams): Structure {
    return new Structure(
      new StructureUid(uid.value),
      nom,
      identifiantEtablissement,
      departementCode
    )
  }
}

export class StructureUid extends Uid<StructureUidState> {
  constructor(value: number) {
    super({ value })
  }
}

export type StructureState = Readonly<{
  departementCode: string
  identifiantEtablissement: string
  nom: string
  uid: StructureUidState
}>

export type StructureUidState = Readonly<{ value: number }>

type StructureFactoryParams = Readonly<{
  departementCode: string
  identifiantEtablissement: string
  nom: string
  uid: { value: number }
}>

/*
 * A décommenter quand ça sera utile
 * const Types = [
 * 'COLLECTIVITE',
 * 'COMMUNE',
 * 'DEPARTEMENT',
 * 'EPCI',
 * 'GIP',
 * 'PRIVATE',
 * 'REGION',
 * ] as const
 *
 * export type TypologieType = (typeof Types)[number]
 *
 * const Statuts = [
 * 'ABANDON',
 * 'ANNULEE',
 * 'CREEE',
 * 'DOUBLON',
 * 'EXAMEN_COMPLEMENTAIRE_COSELEC',
 * 'REFUS_COORDINATEUR',
 * 'REFUS_COSELEC',
 * 'VALIDATION_COSELEC',
 * ] as const
 *
 * export type TypologieStatut = (typeof Statuts)[number]
 */
