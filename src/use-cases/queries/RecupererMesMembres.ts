import { QueryHandler } from '../QueryHandler'
import { alphaAsc } from '@/shared/lang'

export class RecupererMesMembres implements QueryHandler<Query, MesMembresReadModel> {
  readonly #mesMembresLoader: MesMembresLoader

  constructor(mesMembresLoader: MesMembresLoader) {
    this.#mesMembresLoader = mesMembresLoader
  }

  async handle(query: Query): Promise<MesMembresReadModel> {
    return this.#mesMembresLoader.get(query.codeDepartement).then((mesMembres) => {
      return {
        ...mesMembres,
        ...rolesEtTypologies(mesMembres.membres),
      }
    })
  }
}

export interface MesMembresLoader {
  get(codeDepartement: string): Promise<MesMembresReadModel>
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
  uidGouvernance: string
}>

export type MembreReadModel = Readonly<{
  adresse: string
  suppressionDuMembreAutorise: boolean
  contactReferent: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
  }>
  nom: string
  roles: ReadonlyArray<Role>
  siret: string
  typologie: string
  uid: string
  statut: Statut
}>

function rolesEtTypologies(membres: MesMembresReadModel['membres']): RoleEtTypologie {
  const { roles, typologies } = membres.reduce((rolesEtTypologies, membre) => ({
    roles: membre.roles.reduce((roles, role) => roles.add(role), rolesEtTypologies.roles),
    typologies: rolesEtTypologies.typologies.add(membre.typologie),
  }), {
    roles: new Set<Role>(),
    typologies: new Set<string>(),
  })
  return {
    roles: Array.from(roles).toSorted(alphaAsc()),
    typologies: Array.from(typologies).toSorted(alphaAsc()),
  }
}

type Query = Readonly<{
  codeDepartement: string
}>

type RoleEtTypologie = Pick<MesMembresReadModel, 'roles' | 'typologies'>

type Statut = 'confirme' | 'candidat' | 'suggere'

type Role = 'coporteur' | 'cofinanceur' | 'beneficiaire' | 'recipiendaire' | 'observateur'
