import { QueryHandler } from '../QueryHandler'

export class RecupererUneStructure implements QueryHandler<Query, UneStructureReadModel> {
  readonly #uneStructureLoader: UneStructureLoader

  constructor(uneStructureLoader: UneStructureLoader) {
    this.#uneStructureLoader = uneStructureLoader
  }

  async handle(query: Query): Promise<UneStructureReadModel> {
    return this.#uneStructureLoader.get(query.structureId)
  }
}

export interface UneStructureLoader {
  get(structureId: number): Promise<UneStructureReadModel>
}

export type UneStructureReadModel = Readonly<{
  aidantsEtMediateurs: Readonly<{
    liste: ReadonlyArray<{
      fonction: string
      id: number
      lienFiche: string
      logos: ReadonlyArray<string>
      nom: string
      prenom: string
    }>
    totalAidant: number
    totalCoordinateur: number
    totalMediateur: number
  }>
  contactReferent: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
    telephone: string
  }>
  contratsRattaches: ReadonlyArray<{
    contrat: string
    dateDebut: Date | undefined
    dateFin: Date | undefined
    dateRupture: Date | undefined
    mediateur: string
    role: string
  }>
  conventionsEtFinancements: Readonly<{
    conventions: ReadonlyArray<{
      dateDebut: Date
      dateFin: Date
      id: string
      libelle: string
      montantBonification: number
      montantSubvention: number
      montantTotal: number
    }>
    creditsEngagesParLEtat: number
    enveloppes: ReadonlyArray<{
      libelle: string
      montant: number
    }>
    lienConventions: string
  }>
  identite: Readonly<{
    adresse: string
    codePostal: string
    commune: string
    departement: string
    editeur: string
    edition: Date | undefined
    nom: string
    region: string
    siret: string | undefined
    typologie: string
  }>
  role: Readonly<{
    feuillesDeRoute: ReadonlyArray<{
      libelle: string
      lien: string
    }>
    gouvernances: ReadonlyArray<{
      code: string
      nom: string
      roles: ReadonlyArray<RoleType>
    }>
    membreDepuisLe: Date | undefined
  }>
  structureId: number
}>

export type RoleType = 'beneficiaire' | 'cofinanceur' | 'coporteur' | 'recipiendaire'

type Query = Readonly<{
  structureId: number
}>
