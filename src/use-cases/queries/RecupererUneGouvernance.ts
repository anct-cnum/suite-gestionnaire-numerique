
export interface UneGouvernanceReadModelLoader {
  find(codeDepartement: string): Promise<UneGouvernanceReadModel | null>
}

export type UneGouvernanceReadModel = Readonly<{
  departement: string
  comites?: ReadonlyArray<ComiteReadModel>
  feuillesDeRoute?: ReadonlyArray<FeuilleDeRouteReadModel>
  membres?: ReadonlyArray<MembreReadModel>
  noteDeContexte?: Readonly<{
    dateDeModification: Date
    nomAuteur: string
    prenomAuteur: string
    texte: string
  }>
  uid: string
}>

export type ComiteReadModel = Readonly<{
  dateProchainComite: Date
  nom: string
  periodicite: string
  type : TypeDeComite
}>

export type FeuilleDeRouteReadModel = Readonly<{
  nom: string
  porteur: MembreReadModel
  totalActions: number
  budgetGlobal: number
  actions: ReadonlyArray<Action>
  montantSubventionDemande: number
  montantSubventionAccorde: number
  montantSubventionFormationDemande: number
  montantSubventionFormationAccorde: number
  beneficiaires: ReadonlyArray<MembreReadModel>
  beneficiairesSubventionFormation: ReadonlyArray<MembreReadModel>
}>

export type Action = Readonly<{
  besoin: BesoinSubvention
  nom: string
  budgetGlobal: number
  demandesDeSubvention: ReadonlyArray<DemandeDeSubvention>
  demandesDeCofinancement: ReadonlyArray<Cofinancement>
  beneficiaires:Array<MembreReadModel>
  statut: Statut
}>

export type DemandeDeSubvention = Readonly<{
  type: string
  montantDemande: number
  montantAccorde: number
}>

export type Cofinancement = Readonly<{
  emetteur: MembreReadModel
  montantDemande: number
}>

export type MembreReadModel = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
}>

type TypeDeComite = 'stratégique' | 'technique' | 'consultatif' | 'autre'

type BesoinSubvention =
'EtablirUnDiagnosticTerritorial' |
'CoConstruireLaFeuilleDeRoute' |
'RedigerLaFeuilleDeRoute' |
'AppuiJuridique' |
'StructurerUnFonds' |
'MonterDossiersDeSubvention' |
'AnimerLaGouvernance' |
'StructurerUneFiliereDeReconditionnement' |
'CollecterDesDonneesTerritoriales' |
'SensibiliserLesActeursAuxOutilsExistants' |
'AppuyerLaCertificationQualiopi'

type Statut = 'validee' | 'envoyee' | 'acceptee' | 'rejetee'

