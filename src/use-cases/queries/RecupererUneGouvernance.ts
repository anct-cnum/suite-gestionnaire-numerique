import { QueryHandler } from '../QueryHandler'
import { identity, UnaryOperator } from '@/shared/lang'

export class RecupererUneGouvernance implements QueryHandler<Query, UneGouvernanceReadModel> {
  readonly #loader: UneGouvernanceReadModelLoader

  constructor(loader: UneGouvernanceReadModelLoader) {
    this.#loader = loader
  }

  async get({ codeDepartement }: Query): Promise<UneGouvernanceReadModel> {
    return this.#loader.trouverEtEnrichir(codeDepartement, (gouvernance) => ({
      ...gouvernance,
      ...gouvernance.membres && {
        membres: gouvernance.membres.values()
          .map(toMembreDetailAvecTotauxReadModel)
          .map(toMembreDetailIntitulerReadModel)
          .toArray(),
      },
    }))
  }
}

export abstract class UneGouvernanceReadModelLoader {
  async trouverEtEnrichir(
    codeDepartement: string,
    enrichir: UnaryOperator<UneGouvernanceReadModel> = identity
  ): Promise<UneGouvernanceReadModel> {
    return this.find(codeDepartement).then(enrichir)
  }

  protected abstract find(codeDepartement: string): Promise<UneGouvernanceReadModel>
}

export type UneGouvernanceReadModel = Readonly<{
  departement: string
  comites?: ReadonlyArray<ComiteReadModel>
  feuillesDeRoute?: ReadonlyArray<FeuilleDeRouteReadModel>
  membres?: ReadonlyArray<MembreDetailReadModel>
  noteDeContexte?: NoteDeContexteReadModel
  uid: string
}>

export type ComiteReadModel = Readonly<{
  commentaire?: string
  date?: Date
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

export type TypeDeComite = 'stratégique' | 'technique' | 'consultatif' | 'autre'

type NoteDeContexteReadModel = Readonly<{
  dateDeModification: Date
  nomAuteur: string
  prenomAuteur: string
  texte: string
}>
export type MembreDetailReadModel = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
  contactTechnique?: string
  contactReferent: Readonly<{
    nom: string
    prenom: string
    poste: string
    mailContact: string
    denomination: 'Contact référent' | 'Contact politique de la collectivité'
  }>
  telephone: string
  typologieMembre: string
  feuillesDeRoute: ReadonlyArray<Readonly<{
    nom: string
    montantSubventionAccorde: number
    montantSubventionFormationAccorde: number
  }>>
  totalMontantSubventionFormationAccorde?: number
  totalMontantSubventionAccorde?: number
  links: Readonly<{
    plusDetails?: string
  }>
}>

type Query = Readonly<{
  codeDepartement: string
}>

function toMembreDetailAvecTotauxReadModel(membre: MembreDetailReadModel): MembreDetailReadModel {
  const categorieDuMembre = typologieMembre[membre.typologieMembre] ?? typologieMembre.Autre
  return {
    ...membre,
    ...categorieDuMembre === 'autre' && membre.feuillesDeRoute.reduce((result, feuilleDeRoute) => ({
      totalMontantSubventionAccorde: result.totalMontantSubventionAccorde + feuilleDeRoute.montantSubventionAccorde,
      totalMontantSubventionFormationAccorde: result.totalMontantSubventionFormationAccorde +
        feuilleDeRoute.montantSubventionFormationAccorde,
    }), {
      totalMontantSubventionAccorde: 0,
      totalMontantSubventionFormationAccorde: 0,
    }),
  }
}

function toMembreDetailIntitulerReadModel(membre: MembreDetailReadModel): MembreDetailReadModel {
  const categorieDuMembre = typologieMembre[membre.typologieMembre] ?? typologieMembre.Autre
  return {
    ...membre,
    contactReferent: {
      ...membre.contactReferent,
      denomination: categorieDuMembre === 'autre' ? 'Contact référent' : 'Contact politique de la collectivité',
    },
    links: {
      ...categorieDuMembre === 'autre' && { plusDetails: '/' },
    },
  }
}

const typologieMembre: Record<string, string> = {
  Autre: 'autre',
  'Préfecture départementale': 'prefecture',
}
