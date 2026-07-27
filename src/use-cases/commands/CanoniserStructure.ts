import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AdresseGeocodeReadModel, BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'
import { EntrepriseReadModel, SireneLoader } from '@/use-cases/queries/RechercherUneEntreprise'

// Canoniser une structure = écraser ses champs descriptifs (dénomination SIRENE, adresse, état
// administratif, APE, catégorie juridique) avec son image INSEE, la source faisant autorité.
// - Sur une antenne (denomination_antenne non nul) : la fait passer en forme canonique (denomination_antenne mis à null).
// - Sur une structure déjà canonique : la re-synchronise simplement sur l'image INSEE courante.
export class CanoniserStructure implements CommandHandler<Command, CanoniserFailure> {
  readonly #banGeocodingGateway: BanGeocodingGateway
  readonly #repository: CanoniserStructureRepository
  readonly #sireneLoader: SireneLoader

  constructor(
    sireneLoader: SireneLoader,
    banGeocodingGateway: BanGeocodingGateway,
    repository: CanoniserStructureRepository
  ) {
    this.#banGeocodingGateway = banGeocodingGateway
    this.#repository = repository
    this.#sireneLoader = sireneLoader
  }

  async handle(command: Command): ResultAsync<CanoniserFailure> {
    const structure = await this.#repository.lireStructure(command.structureId)
    if (structure === null || structure.deletedAt !== null) {
      return 'structureIntrouvable'
    }
    // Sans SIRET, impossible d'interroger l'INSEE pour produire l'image canonique.
    if (structure.siret === null) {
      return 'siretManquant'
    }

    // Garde collision : la contrainte UNIQUE NULLS NOT DISTINCT (siret, denomination_antenne)
    // interdit deux canoniques de même SIRET. On refuse plutôt que de heurter la base.
    if (await this.#repository.existeCanoniquePourSiret(structure.siret, command.structureId)) {
      return 'canoniqueExistante'
    }

    // L'API INSEE ne renvoie que les établissements actifs : un établissement fermé ou introuvable
    // remonte EntrepriseNonTrouvee (cf. ApiSireneLoader.validerEtablissement).
    const entreprise = await this.#sireneLoader.rechercherParIdentifiant(structure.siret)
    if ('estTrouvee' in entreprise) {
      return 'entrepriseIntrouvable'
    }

    // Adresse best-effort : on géocode l'adresse INSEE via la BAN pour obtenir le geom. Si la BAN ne
    // trouve rien, on canonise quand même les autres champs sans re-pointer adresse_id.
    const geocode = await this.#banGeocodingGateway.geocoder({
      adresse: entreprise.adresse,
      codeInsee: entreprise.codeInsee,
    })

    return this.#repository.canoniser({
      entreprise,
      geocode,
      parUtilisateur: command.uidUtilisateur,
      structureId: command.structureId,
    })
  }
}

export interface CanoniserStructureRepository {
  canoniser(canonisation: Canonisation): ResultAsync<CanoniserFailure>
  existeCanoniquePourSiret(siret: string, exceptId: number): Promise<boolean>
  lireStructure(structureId: number): Promise<null | StructureACanoniser>
}

export type StructureACanoniser = Readonly<{
  deletedAt: Date | null
  denominationAntenne: null | string
  siret: null | string
}>

export type Canonisation = Readonly<{
  entreprise: EntrepriseReadModel
  geocode: AdresseGeocodeReadModel | null
  parUtilisateur: string
  structureId: number
}>

export type CanoniserFailure =
  | 'canoniqueExistante'
  // Une canonique de même SIRET existe déjà : la canonisation violerait la contrainte d'unicité.
  | 'canonisationEchouee'
  | 'entrepriseIntrouvable'
  | 'siretManquant'
  | 'structureIntrouvable'

type Command = Readonly<{
  structureId: number
  uidUtilisateur: string
}>
