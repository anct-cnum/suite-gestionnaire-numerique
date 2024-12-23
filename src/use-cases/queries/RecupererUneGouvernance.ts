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

export type MembreDetailsReadModel = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
  contactTechnique: string,
  contactReferent: Readonly<{
    nom: string
    prenom: string
    poste: string
    mailContact: string
  }>,
  telephone: string,
  typologieMembre: string,
  feuillesDeRoute: ReadonlyArray<Readonly<{
    nom: string
    montantSubventionAccorde: number
    montantSubventionFormationAccorde: number
  }>>
}>

export type TypeDeComite = 'stratégique' | 'technique' | 'consultatif' | 'autre'
