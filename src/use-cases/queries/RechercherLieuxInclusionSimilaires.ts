import { QueryHandler } from '../QueryHandler'
import { BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

// Lieux déjà déclarés à l'adresse saisie, pendant la création d'un lieu (#1495).
// Maquettes V6 : un seul signal, l'adresse. L'adresse saisie est géocodée pour
// comparer par clef BAN ; la création n'est jamais bloquée, les lieux trouvés sont
// montrés pour que l'humain tranche.
export class RechercherLieuxInclusionSimilaires implements QueryHandler<
  Query,
  ReadonlyArray<LieuInclusionSimilaireReadModel>
> {
  readonly #banGeocodingGateway: BanGeocodingGateway
  readonly #loader: LieuxInclusionSimilairesLoader

  constructor(banGeocodingGateway: BanGeocodingGateway, loader: LieuxInclusionSimilairesLoader) {
    this.#banGeocodingGateway = banGeocodingGateway
    this.#loader = loader
  }

  async handle(query: Query): Promise<ReadonlyArray<LieuInclusionSimilaireReadModel>> {
    if (query.adresse === '') {
      return []
    }

    // Sans clef BAN, aucune comparaison d'adresse n'est possible : on ne propose rien
    // plutôt que de rapprocher des lieux sur un texte libre.
    const geocode = await this.#banGeocodingGateway.geocoder({ adresse: query.adresse })
    if (geocode === null) {
      return []
    }

    return this.#loader.rechercher({ clefInterop: geocode.banClefInterop })
  }
}

export interface LieuxInclusionSimilairesLoader {
  rechercher(criteres: CriteresLieuxSimilaires): Promise<ReadonlyArray<LieuInclusionSimilaireReadModel>>
}

export type CriteresLieuxSimilaires = Readonly<{
  clefInterop: string
}>

export type LieuInclusionSimilaireReadModel = Readonly<{
  adresse: string
  id: string
  nom: string
  nombrePersonnesRattachees: number
  siret: null | string
  typologies: ReadonlyArray<string>
}>

type Query = Readonly<{
  adresse: string
}>
