import { QueryHandler } from '../QueryHandler'
import { BesoinsPossible } from './shared/ActionReadModel'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'

export class RecupererLesFeuillesDeRoute implements QueryHandler<Query, FeuillesDeRouteReadModel> {
  readonly #feuillesDeRouteLoader: FeuillesDeRouteLoader
  readonly #poidsDocumentLoader: PoidsDocumentLoader

  constructor(feuillesDeRouteLoader: FeuillesDeRouteLoader, poidsDocumentLoader: PoidsDocumentLoader) {
    this.#feuillesDeRouteLoader = feuillesDeRouteLoader
    this.#poidsDocumentLoader = poidsDocumentLoader
  }

  async handle({ codeDepartement }: Query): Promise<FeuillesDeRouteReadModel> {
    const readModel = await this.#feuillesDeRouteLoader.get(codeDepartement)
    const feuillesDeRoute = await Promise.all(
      readModel.feuillesDeRoute.map(async (feuilleDeRoute) =>
        feuilleDeRoute.pieceJointe === undefined
          ? feuilleDeRoute
          : {
              ...feuilleDeRoute,
              pieceJointe: {
                ...feuilleDeRoute.pieceJointe,
                poids: await this.#lirePoids(feuilleDeRoute.pieceJointe.chemin),
              },
            }
      )
    )
    return { ...readModel, feuillesDeRoute }
  }

  // Le poids n'est jamais inventé : si le stockage ne répond pas, il reste inconnu et la page s'affiche quand même
  async #lirePoids(chemin: string): Promise<number | undefined> {
    try {
      return await this.#poidsDocumentLoader.lirePoids(chemin)
    } catch {
      return undefined
    }
  }
}

export interface FeuillesDeRouteLoader {
  get(codeDepartement: string): Promise<FeuillesDeRouteReadModel>
}

export interface PoidsDocumentLoader {
  // Poids en octets du document stocké, sans le télécharger
  lirePoids(chemin: string): Promise<number | undefined>
}

export type FeuillesDeRouteReadModel = Readonly<{
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteReadModel>
  porteursPotentielsNouvellesFeuillesDeRouteOuActions: ReadonlyArray<MembreAvecRoleDansLaGouvernance>
  totaux: Readonly<{
    budget: number
    coFinancement: number
    financementAccorde: number
  }>
  uidGouvernance: string
}>

export type MembreAvecRoleDansLaGouvernance = Membre &
  Readonly<{ roles: ReadonlyArray<string> }> &
  Readonly<{ type?: string }>

type FeuilleDeRouteReadModel = Readonly<{
  actions: ReadonlyArray<ActionReadModel>
  beneficiaires: number
  coFinanceurs: number
  nom: string
  pieceJointe?: Readonly<{
    chemin: string
    nom: string
    // Poids en octets, lu dans le stockage ; absent s'il n'a pas pu être lu
    poids?: number
    upload: Date
  }>
  structureCoPorteuse?: Membre
  totaux: Readonly<{
    budget: number
    coFinancement: number
    financementAccorde: number
  }>
  uid: string
}>

type ActionReadModel = Readonly<{
  beneficiaires: ReadonlyArray<Membre>
  besoins: ReadonlyArray<BesoinsPossible>
  budgetGlobal: number
  coFinancements: ReadonlyArray<
    Readonly<{
      coFinanceur: Membre
      montant: number
    }>
  >
  contexte: string
  description: string
  nom: string
  porteurs: ReadonlyArray<Membre>
  subvention?: Readonly<{
    enveloppe: string
    montants: Readonly<{
      prestation: number
      ressourcesHumaines: number
    }>
    statut: StatutSubvention
  }>
  totaux: Readonly<{
    coFinancement: number
    financementAccorde: number
  }>
  uid: string
}>

type Membre = Readonly<{
  nom: string
  structureId: number
  uid: string
}>

type Query = Readonly<{
  codeDepartement: string
}>
