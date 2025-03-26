import { GetUtilisateurRepository } from '../commands/shared/UtilisateurRepository'
import { QueryHandler } from '../QueryHandler'
import { Gouvernance } from '@/domain/Gouvernance'

export class RecupererUneGouvernance implements QueryHandler<Query, UneGouvernanceReadModel> {
  readonly #loader: UneGouvernanceLoader
  readonly #repository: GetUtilisateurRepository

  constructor(loader: UneGouvernanceLoader, repository: GetUtilisateurRepository) {
    this.#loader = loader
    this.#repository = repository
  }

  async handle(query: Query): Promise<UneGouvernanceReadModel> {
    const readModel = await this.#loader.get(query.codeDepartement)
      .then((gouvernance) => ({
        ...gouvernance,
        syntheseMembres: {
          ...gouvernance.syntheseMembres,
          coporteurs: gouvernance.syntheseMembres.coporteurs
            .map(toMembreDetailIntitulerReadModel),
        },
      }))
    const utilisateurCourant = await this.#repository.get(query.uidUtilisateurCourant)
    const peutVoirNotePrivee = Gouvernance.laNotePriveePeutEtreGereePar(utilisateurCourant, readModel.uid)
    return {
      ...readModel,
      peutVoirNotePrivee,
    }
  }
}

export interface UneGouvernanceLoader {
  get(codeDepartement: string): Promise<UneGouvernanceReadModel>
}

export type UneGouvernanceReadModel = Readonly<{
  comites?: ReadonlyArray<ComiteReadModel>
  departement: string
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteReadModel>
  noteDeContexte?: NoteDeContexteReadModel
  notePrivee?: NotePriveeReadModel
  peutVoirNotePrivee: boolean
  syntheseMembres: SyntheseMembres
  uid: string
}>

export type ComiteReadModel = Readonly<{
  commentaire?: string
  date?: Date
  derniereEdition: Date
  frequence: string
  id: number
  nomEditeur: string
  prenomEditeur: string
  type: TypeDeComite
}>

export type FeuilleDeRouteReadModel = Readonly<{
  beneficiairesSubvention: ReadonlyArray<MembreReadModel>
  beneficiairesSubventionFormation: ReadonlyArray<MembreReadModel>
  budgetGlobal: number
  montantSubventionAccordee: number
  montantSubventionDemandee: number
  montantSubventionFormationAccordee: number
  nom: string
  pieceJointe?: Readonly<{
    apercu: string
    emplacement: string
    metadonnees?: Readonly<{
      format: string
      taille: string
      upload: Date
    }>
    nom: string
  }>
  porteur?: MembreReadModel
  totalActions: number
  uid: string
}>

export type MembreReadModel = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
  uid: string
}>

export type TypeDeComite = 'autre' | 'consultatif' | 'stratégique' | 'technique'

export type CoporteurDetailReadModel = Readonly<{
  contactReferent: Readonly<{
    denomination: 'Contact politique de la collectivité' | 'Contact référent'
    mailContact: string
    nom: string
    poste: string
    prenom: string
  }>
  contactTechnique?: string
  feuillesDeRoute: ReadonlyArray<Readonly<{
    nom: string
    uid: string
  }>>
  links: Readonly<{
    plusDetails?: string
  }>
  nom: string
  roles: ReadonlyArray<string>
  telephone?: string
  totalMontantsSubventionsAccordees?: number
  totalMontantsSubventionsFormationAccordees?: number
  type: string
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

type SyntheseMembres = Readonly<{
  candidats: number
  coporteurs: ReadonlyArray<CoporteurDetailReadModel>
  total: number
}>

type Query = Readonly<{
  codeDepartement: string
  uidUtilisateurCourant: string
}>

function toMembreDetailIntitulerReadModel(membre: CoporteurDetailReadModel): CoporteurDetailReadModel {
  const [denomination, links] = isPrefectureDepartementale(membre)
    ? ['Contact politique de la collectivité' as const, {}]
    : ['Contact référent' as const, { plusDetails: '/' }]
  return {
    ...membre,
    contactReferent: {
      ...membre.contactReferent,
      denomination,
    },
    links,
  }
}
function isPrefectureDepartementale(coporteur: CoporteurDetailReadModel): boolean {
  return coporteur.type === 'Préfecture départementale'
}
