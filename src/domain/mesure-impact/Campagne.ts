import { Entity, Uid } from '@/domain/shared/Model'

// Campagne de mesure d'impact : la passation d'une version du questionnaire pour une structure.
// La structure n'est connue que par son identifiant : le contexte ne dépend pas du modèle du back-office.
export class Campagne extends Entity<CampagneState> {
  override get state(): CampagneState {
    return {
      fermeture: this.#fermeture?.toJSON() ?? null,
      identifiantPublic: this.#identifiantPublic,
      libelleTerritoire: this.#libelleTerritoire,
      nom: this.#nom,
      ouverture: this.#ouverture.toJSON(),
      questionnaireVersion: this.#questionnaireVersion,
      structureId: this.#structureId,
      uid: this.uid.state,
    }
  }

  readonly #fermeture: Date | null
  readonly #identifiantPublic: string
  readonly #libelleTerritoire: string
  readonly #nom: string
  readonly #ouverture: Date
  readonly #questionnaireVersion: string
  readonly #structureId: number

  private constructor(
    uid: CampagneUid,
    nom: string,
    identifiantPublic: string,
    libelleTerritoire: string,
    structureId: number,
    questionnaireVersion: string,
    ouverture: Date,
    fermeture: Date | null
  ) {
    super(uid)
    this.#nom = nom
    this.#identifiantPublic = identifiantPublic
    this.#libelleTerritoire = libelleTerritoire
    this.#structureId = structureId
    this.#questionnaireVersion = questionnaireVersion
    this.#ouverture = ouverture
    this.#fermeture = fermeture
    Object.freeze(this)
  }

  static create({
    fermeture,
    identifiantPublic,
    libelleTerritoire,
    nom,
    ouverture,
    questionnaireVersion,
    structureId,
    uid,
  }: CampagneFactoryParams): Campagne {
    return new Campagne(
      new CampagneUid(uid.value),
      nom,
      identifiantPublic,
      libelleTerritoire,
      structureId,
      questionnaireVersion,
      ouverture,
      fermeture
    )
  }

  // Ouverte de sa date d'ouverture (incluse) à sa date de fermeture (exclue), sans fin si elle n'en a pas
  accepteDesReponses(date: Date): boolean {
    return date >= this.#ouverture && (this.#fermeture === null || date < this.#fermeture)
  }
}

class CampagneUid extends Uid<CampagneUidState> {
  constructor(value: number) {
    super({ value })
  }
}

type CampagneState = Readonly<{
  fermeture: null | string
  identifiantPublic: string
  libelleTerritoire: string
  nom: string
  ouverture: string
  questionnaireVersion: string
  structureId: number
  uid: CampagneUidState
}>

type CampagneUidState = Readonly<{ value: number }>

type CampagneFactoryParams = Readonly<{
  fermeture: Date | null
  identifiantPublic: string
  libelleTerritoire: string
  nom: string
  ouverture: Date
  questionnaireVersion: string
  structureId: number
  uid: CampagneUidState
}>
