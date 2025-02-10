import { QueryHandler } from '../QueryHandler'

export class RecupererMesMembres implements QueryHandler<Query, MesMembresReadModel> {
  readonly #mesMembresLoader: MesMembresLoader

  constructor(mesMembresLoader: MesMembresLoader) {
    this.#mesMembresLoader = mesMembresLoader
  }

  async handle(query: Query): Promise<MesMembresReadModel> {
    return this.#mesMembresLoader.get(query.codeDepartement).then((mesMembres) => {
      return {
        ...mesMembres,
        ...roleEtTypologieDistinct(mesMembres.membres),
      }
    })
  }
}

export interface MesMembresLoader {
  get(codeDepartement: string): Promise<MesMembresReadModel>
}

function roleEtTypologieDistinct(membres: MesMembresReadModel['membres']): Pick<MesMembresReadModel, 'roles' | 'typologies'> {
  return membres.reduce<Pick<MesMembresReadModel, 'roles' | 'typologies'>>((rolesEtTypologies, membre) => ({
    roles: [...new Set(rolesEtTypologies.roles.concat(membre.roles))],
    typologies: [...new Set(rolesEtTypologies.typologies.concat(membre.typologie))],
  }), {
    roles: [],
    typologies: [],
  })
}

export type MesMembresReadModel = Readonly<{
  autorisations: Readonly<{
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
    accesMembreConfirme: boolean
  }>
  departement: string
  typologies: ReadonlyArray<string>
  roles: ReadonlyArray<Role>
  membres: ReadonlyArray<MembreReadModel>
  candidats: ReadonlyArray<MembreReadModel>
  suggeres: ReadonlyArray<MembreReadModel>
  uidGouvernance: string
}>

export type MembreReadModel = Readonly<{
  adresse: string
  suppressionDuMembreAutorise: boolean
  contactReferent?: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
  }>
  nom: string
  roles: ReadonlyArray<Role>
  siret: string
  typologie: string
  uidMembre: string
}>

type Query = Readonly<{
  codeDepartement: string
}>

type Role = 'coporteur' | 'cofinanceur' | 'beneficiaire' | 'recipiendaire' | 'observateur'
