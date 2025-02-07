import { QueryHandler } from '../QueryHandler'

export class RecupererUneGouvernance implements QueryHandler<Query, UneGouvernanceReadModel> {
  readonly #loader: UneGouvernanceReadModelLoader

  constructor(loader: UneGouvernanceReadModelLoader) {
    this.#loader = loader
  }

  async handle(query: Query): Promise<UneGouvernanceReadModel> {
    return this.#loader.get(query.codeDepartement)
      .then((gouvernance) =>
        ({
          ...gouvernance,
          ...gouvernance.coporteurs && {
            coporteurs: gouvernance.coporteurs.values()
              .map(toMembreDetailAvecTotauxReadModel)
              .map(toMembreDetailIntitulerReadModel)
              .toArray(),
          },
        }))
  }
}

export interface UneGouvernanceReadModelLoader {
  get(codeDepartement: string): Promise<UneGouvernanceReadModel>
}

export type UneGouvernanceReadModel = Readonly<{
  departement: string
  comites?: ReadonlyArray<ComiteReadModel>
  feuillesDeRoute?: ReadonlyArray<FeuilleDeRouteReadModel>
  coporteurs?: ReadonlyArray<CoporteurDetailReadModel>
  noteDeContexte?: NoteDeContexteReadModel
  notePrivee?: NotePriveeReadModel
  uid: string
}>

export type ComiteReadModel = Readonly<{
  commentaire?: string
  date?: Date
  derniereEdition: Date
  id: number
  nomEditeur: string
  frequence: string
  prenomEditeur: string
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

export type CoporteurDetailReadModel = Readonly<{
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

type NoteDeContexteReadModel = Readonly<{
  dateDeModification: Date
  nomAuteur: string
  prenomAuteur: string
  texte: string
}>

type NotePriveeReadModel = Readonly<{
  dateDEdition: Date
  nomEditeur: string
  prenomEditeur: string
  texte: string
}>

type Query = Readonly<{
  codeDepartement: string
}>

function toMembreDetailAvecTotauxReadModel(membre: CoporteurDetailReadModel): CoporteurDetailReadModel {
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

function toMembreDetailIntitulerReadModel(membre: CoporteurDetailReadModel): CoporteurDetailReadModel {
  const categorieDuMembre = typologieMembre[membre.typologieMembre] ?? typologieMembre.Autre
  return {
    ...membre,
    contactReferent: { ...membre.contactReferent, denomination: categorieDuMembre === 'autre' ? 'Contact référent' : 'Contact politique de la collectivité' },
    links: { ...categorieDuMembre === 'autre' && { plusDetails: '/' } },
  }
}

const typologieMembre: Record<string, string> = {
  Autre: 'autre',
  'Préfecture départementale': 'prefecture',
}
