import { GetMembresDuGestionnaireRepository } from '../commands/shared/MembreRepository'
import { QueryHandler } from '../QueryHandler'
import { Membre } from '@/domain/Membre'

export class RecupererUneGouvernance implements QueryHandler<Query, UneGouvernanceReadModel> {
  readonly #loader: UneGouvernanceLoader
  readonly #repository: GetMembresDuGestionnaireRepository

  constructor(loader: UneGouvernanceLoader, repository: GetMembresDuGestionnaireRepository) {
    this.#loader = loader
    this.#repository = repository
  }

  async handle(query: Query): Promise<UneGouvernanceReadModel> {
    const readModel = await this.#loader.get(query.codeDepartement)
      .then((gouvernance) => ({
        ...gouvernance,
        syntheseMembres: {
          ...gouvernance.syntheseMembres,
          coporteurs: gouvernance.syntheseMembres.coporteurs.values()
            .map(toMembreDetailAvecTotauxReadModel)
            .map(toMembreDetailIntitulerReadModel)
            .toArray(),
        },
      }))
    const membres = await this.#repository.getMembres(query.uidUtilisateurCourant)
    const peutVoirNotePrivee = Membre.gestionnairePeutVoirNotePrivee(membres, query.codeDepartement)
    return  {
      ...readModel,
      peutVoirNotePrivee,
    }
  }
}

export interface UneGouvernanceLoader {
  get(codeDepartement: string): Promise<UneGouvernanceReadModel>
}

export type UneGouvernanceReadModel = Readonly<{
  departement: string
  comites?: ReadonlyArray<ComiteReadModel>
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteReadModel>
  syntheseMembres: SyntheseMembres
  noteDeContexte?: NoteDeContexteReadModel
  notePrivee?: NotePriveeReadModel
  uid: string
  peutVoirNotePrivee: boolean
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
  uid: string
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

type SyntheseMembres = Readonly<{
  coporteurs: ReadonlyArray<CoporteurDetailReadModel>
  total: number
  candidats: number
}>

type Query = Readonly<{
  codeDepartement: string
  uidUtilisateurCourant: string
}>

function toMembreDetailAvecTotauxReadModel(membre: CoporteurDetailReadModel): CoporteurDetailReadModel {
  const totaux = isPrefectureDepartementale(membre)
    ? {} : membre.feuillesDeRoute.reduce((result, feuilleDeRoute) => ({
      totalMontantSubventionAccorde: result.totalMontantSubventionAccorde + feuilleDeRoute.montantSubventionAccorde,
      totalMontantSubventionFormationAccorde: result.totalMontantSubventionFormationAccorde +
        feuilleDeRoute.montantSubventionFormationAccorde,
    }), {
      totalMontantSubventionAccorde: 0,
      totalMontantSubventionFormationAccorde: 0,
    })
  return {
    ...membre,
    ...totaux,
  }
}

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
