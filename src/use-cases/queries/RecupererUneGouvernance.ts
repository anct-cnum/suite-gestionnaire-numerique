
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
}>

export type FeuilleDeRouteReadModel = Readonly<{
  nom: string
  porteur: MembreReadModel
  totalActions: number
  budgetGlobal: number
  actions: ReadonlyArray<Action>
  montantSubventionFormationDemande: number
  montantSubventionFormationAccorde: number
  beneficiaire: MembreReadModel
  beneficiaireSubventionFormation: MembreReadModel
}>

export type Action = Readonly<{
  besoin: besoinSubvention
  nom: string
  budgetGlobal: number
  demandesDeSubvention: ReadonlyArray<DemandeDeSubvention>
  demandesDeCofinancement: ReadonlyArray<Cofinancement>
  beneficiaires:Array<MembreReadModel>
  statut: statut
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

type besoinSubvention =
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

type statut = 'validee' | 'envoyee' | 'acceptee' | 'rejetee'

