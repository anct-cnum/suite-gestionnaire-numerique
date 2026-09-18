import { QueryHandler } from '../QueryHandler'
import { BanGeocodingGateway } from '@/gateways/apiBan/BanGeocodingGateway'

// Lieux existants aux alentours d'un lieu en cours de création (#1495) : la création
// n'est jamais bloquée, on montre les candidats pour que l'humain tranche. L'adresse
// saisie est géocodée pour comparer par clef BAN et par commune.
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
    const geocode =
      query.adresse === undefined || query.adresse === ''
        ? null
        : await this.#banGeocodingGateway.geocoder({ adresse: query.adresse })

    return this.#loader.rechercher({
      clefInterop: geocode?.banClefInterop ?? null,
      codeInsee: geocode?.banCodeInsee ?? null,
      nom: query.nom,
      siret: query.siret ?? null,
    })
  }
}

export interface LieuxInclusionSimilairesLoader {
  rechercher(criteres: CriteresLieuxSimilaires): Promise<ReadonlyArray<LieuInclusionSimilaireReadModel>>
}

export type CriteresLieuxSimilaires = Readonly<{
  clefInterop: null | string
  codeInsee: null | string
  nom: string
  siret: null | string
}>

export type LieuInclusionSimilaireReadModel = Readonly<{
  adresse: string
  estLieuCoop: boolean
  id: string
  motif: 'adresse' | 'nom' | 'siret'
  nom: string
  siret: null | string
}>

type Query = Readonly<{
  adresse?: string
  nom: string
  siret?: string
}>
