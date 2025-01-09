import { QueryHandler } from '../QueryHandler'

export class RecupererUneGouvernance implements QueryHandler<Query, Partial<GouvernanceReadModel>> {
  readonly #loader: UneGouvernanceReadModelLoader

  constructor(loader: UneGouvernanceReadModelLoader) {
    this.#loader = loader
  }

  async get({ codeDepartement }: Query): Promise<Partial<GouvernanceReadModel>> {
    
    const gouvernance = await this.#loader.find(codeDepartement)

    return gouvernance === null ? {} : {
      ...gouvernance,
      totalMontantSubventionFormationAccorde: this.#calculSubvention(membre.feuillesDeRoute.map((i) => i.montantSubventionFormationAccorde))
    }
  }

  #calculSubvention(array: ReadonlyArray<number>): number {
    return array.reduce(
      (result: number, montant: number) =>
        result + (!isNaN(montant) ? montant : 0),
      0
    )
  }
}

type Query = Readonly<{
  codeDepartement: string
}>

type GouvernanceReadModel = UneGouvernanceReadModel & Readonly<{
  totalMontantSubventionFormationAccorde: number
}>

export interface UneGouvernanceReadModelLoader {
  find(codeDepartement: string): Promise<UneGouvernanceReadModel | null>
}

export type UneGouvernanceReadModel = Readonly<{
  departement: string
  comites?: ReadonlyArray<ComiteReadModel>
  feuillesDeRoute?: ReadonlyArray<FeuilleDeRouteReadModel>
  membres?: ReadonlyArray<MembreDetailsReadModel>
  noteDeContexte?: NoteDeContexteReadModel
  uid: string
}>

type NoteDeContexteReadModel = Readonly<{
  dateDeModification: Date
  nomAuteur: string
  prenomAuteur: string
  texte: string
}>

type ComiteReadModel = Readonly<{
  commentaire?: string
  dateProchainComite?: Date
  nom?: string
  periodicite: string
  type: TypeDeComite
}>

export type FeuilleDeRouteReadModel = Readonly<{
  nom: string
  porteur: MembreReadModel
  totalActions: number
  budgetGlobal: number
  montantSubventionDemande: number
  montantSubventionAccorde: number
  montantSubventionFormationAccorde: number
  beneficiairesSubvention: ReadonlyArray<MembreReadModel>
  beneficiairesSubventionFormation: ReadonlyArray<MembreReadModel>
}>

export type MembreReadModel = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
}>

export type MembreDetailsReadModel = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
  contactTechnique: string
  contactReferent: Readonly<{
    nom: string
    prenom: string
    poste: string
    mailContact: string
  }>
  telephone: string
  typologieMembre: string
  feuillesDeRoute: ReadonlyArray<Readonly<{
    nom: string
    montantSubventionAccorde: number
    montantSubventionFormationAccorde: number
  }>>
}>

export type TypeDeComite = 'stratégique' | 'technique' | 'consultatif' | 'autre'
