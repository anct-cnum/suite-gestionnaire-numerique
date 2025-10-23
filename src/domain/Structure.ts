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

export class StructureAdresse extends Entity<StructureAdresseState> {
  override get state(): StructureAdresseState {
    return {
      clefInterop: this.#clefInterop,
      codeBan: this.#codeBan,
      codeInsee: this.#codeInsee,
      codePostal: this.#codePostal,
      departement: this.#departement,
      nomCommune: this.#nomCommune,
      nomVoie: this.#nomVoie,
      numeroVoie: this.#numeroVoie,
      repetition: this.#repetition,
      uid: this.uid.state,
    }
  }

  readonly #clefInterop: null | string
  readonly #codeBan: null | string
  readonly #codeInsee: null | string
  readonly #codePostal: null | string
  readonly #departement: null | string
  readonly #nomCommune: null | string
  readonly #nomVoie: null | string
  readonly #numeroVoie: null | number
  readonly #repetition: null | string

  private constructor(
    uid: StructureAdresseUid,
    clefInterop: null | string,
    codeBan: null | string,
    codeInsee: null | string,
    codePostal: null | string,
    nomCommune: null | string,
    nomVoie: null | string,
    numeroVoie: null | number,
    repetition: null | string,
    departement: null | string
  ) {
    super(uid)
    this.#clefInterop = clefInterop
    this.#codeBan = codeBan
    this.#codeInsee = codeInsee
    this.#codePostal = codePostal
    this.#nomCommune = nomCommune
    this.#nomVoie = nomVoie
    this.#numeroVoie = numeroVoie
    this.#repetition = repetition
    this.#departement = departement
  }

  static create({
    clefInterop,
    codeBan,
    codeInsee,
    codePostal,
    departement,
    nomCommune,
    nomVoie,
    numeroVoie,
    repetition,
    uid,
  }: StructureAdresseFactoryParams): StructureAdresse {
    return new StructureAdresse(
      new StructureAdresseUid(uid.value),
      clefInterop,
      codeBan,
      codeInsee,
      codePostal,
      nomCommune,
      nomVoie,
      numeroVoie,
      repetition,
      departement
    )
  }
}

export class StructureAdresseUid extends Uid<StructureAdresseUidState> {
  constructor(value: number) {
    super({ value })
  }
}

type StructureAdresseState = Readonly<{
  clefInterop: null | string
  codeBan: null | string
  codeInsee: null | string
  codePostal: null | string
  departement: null | string
  nomCommune: null | string
  nomVoie: null | string
  numeroVoie: null | number
  repetition: null | string
  uid: StructureAdresseUidState
}>

type StructureAdresseUidState = Readonly<{ value: number }>

type StructureFactoryParams = Readonly<{
  departementCode: string
  identifiantEtablissement: string
  nom: string
  uid: { value: number }
}>

type StructureAdresseFactoryParams = Readonly<{
  clefInterop: null | string
  codeBan: null | string
  codeInsee: null | string
  codePostal: null | string
  departement: null | string
  nomCommune: null | string
  nomVoie: null | string
  numeroVoie: null | number
  repetition: null | string
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
