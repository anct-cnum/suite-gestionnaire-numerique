import { QueryHandler } from '../QueryHandler'

export class RecupererUneGouvernance implements QueryHandler<Query, GouvernanceReadModel> {
  readonly #loader: UneGouvernanceReadModelLoader

  constructor(loader: UneGouvernanceReadModelLoader) {
    this.#loader = loader
  }

  async get({ codeDepartement }: Query): Promise<GouvernanceReadModel> {
    const gouvernance = await this.#loader.find(codeDepartement)

    return gouvernance === null ? null : {
      ...gouvernance,
      membres: (gouvernance.membres ?? []).map(toMembreDetailAvecTotauxReadModel),
    }
  }
}

function toMembreDetailAvecTotauxReadModel(membre: MembreDetailsReadModel): MembreDetailAvecTotauxMontantsReadModel {
  return {
    ...membre,
    ...membre.feuillesDeRoute.reduce((result, feuilleDeRoute) => ({
      totalMontantSubventionAccorde: result.totalMontantSubventionAccorde + feuilleDeRoute.montantSubventionAccorde,
      totalMontantSubventionFormationAccorde: result.totalMontantSubventionFormationAccorde +
        feuilleDeRoute.montantSubventionFormationAccorde,
    }), {
      totalMontantSubventionAccorde: 0,
      totalMontantSubventionFormationAccorde: 0,
    }),
  }
}

type Query = Readonly<{
  codeDepartement: string
}>

export type GouvernanceReadModel = Omit<UneGouvernanceReadModel, 'membres'> & Readonly<{
  membres: ReadonlyArray<MembreDetailAvecTotauxMontantsReadModel>
}> | null

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

export type ComiteReadModel = Readonly<{
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

export type MembreDetailAvecTotauxMontantsReadModel = MembreDetailsReadModel & {
  totalMontantSubventionFormationAccorde: number
  totalMontantSubventionAccorde: number
}
export type TypeDeComite = 'stratégique' | 'technique' | 'consultatif' | 'autre'

type NoteDeContexteReadModel = Readonly<{
  dateDeModification: Date
  nomAuteur: string
  prenomAuteur: string
  texte: string
}>

type MembreDetailsReadModel = Readonly<{
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
