import { GetUtilisateurRepository } from '../commands/shared/UtilisateurRepository'
import { QueryHandler } from '../QueryHandler'
import { MembreAvecRoleDansLaGouvernance } from './RecupererLesFeuillesDeRoute'
import { Gouvernance } from '@/domain/Gouvernance'

export class RecupererUneGouvernance implements QueryHandler<Query, UneGouvernanceReadModel> {
  readonly #loader: UneGouvernanceLoader
  readonly #now: Date
  readonly #repository: GetUtilisateurRepository

  constructor(loader: UneGouvernanceLoader, repository: GetUtilisateurRepository, now: Date) {
    this.#loader = loader
    this.#repository = repository
    this.#now = now
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
    const peutGererGouvernance = Gouvernance.peutEtreGereePar(utilisateurCourant, readModel.uid)

    // Met les dates des comites à undefined si elles sont dans le passé
    const comites = readModel.comites?.map((comite) => ({
      ...comite,
      date: comite.date !== undefined && comite.date < this.#now ? undefined : comite.date,
    }))

    return {
      ...readModel,
      comites,
      peutGererGouvernance,
      peutVoirNotePrivee,
    }
  }
}

export interface UneGouvernanceLoader {
  get(codeDepartement: string): Promise<UneGouvernanceLoaderReadModel>
}

export type UneGouvernanceLoaderReadModel = Readonly<{
  comites?: ReadonlyArray<ComiteReadModel>
  departement: string
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteReadModel>
  noteDeContexte?: NoteDeContexteReadModel
  notePrivee?: NotePriveeReadModel
  porteursPotentielsNouvellesFeuillesDeRouteOuActions: ReadonlyArray<MembreAvecRoleDansLaGouvernance>
  syntheseMembres: SyntheseMembres
  uid: string
}>

export type UneGouvernanceReadModel = Readonly<{
  comites?: ReadonlyArray<ComiteReadModel>
  departement: string
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteReadModel>
  noteDeContexte?: NoteDeContexteReadModel
  notePrivee?: NotePriveeReadModel
  peutGererGouvernance: boolean
  peutVoirNotePrivee: boolean
  porteursPotentielsNouvellesFeuillesDeRouteOuActions: ReadonlyArray<MembreAvecRoleDansLaGouvernance>
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
  beneficiairesSubventionAccordee: ReadonlyArray<MembreReadModel>
  beneficiairesSubventionFormation: ReadonlyArray<MembreReadModel>
  beneficiairesSubventionFormationAccordee: ReadonlyArray<MembreReadModel>
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
  uid: string
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
