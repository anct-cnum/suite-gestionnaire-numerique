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
        membres: mesMembres.membres.map((membre) => (
          {
            ...membre,
            isDeletable: !isPrefectureDepartementale(membre),
          }
        )),
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
    accesMembreConfirme: boolean
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
  }>
  departement: string
  membres: ReadonlyArray<MembreReadModel>
  roles: ReadonlyArray<Role>
  typologies: ReadonlyArray<string>
  uidGouvernance: string
}>

export type MembreReadModel = Readonly<{
  adresse: string
  contactReferent: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
  }>
  isDeletable: boolean
  nom: string
  roles: ReadonlyArray<Role>
  siret: string
  statut: Statut
  suppressionDuMembreAutorise: boolean
  typologie: string
  uid: string
}>

function isPrefectureDepartementale(membre: MesMembresReadModel['membres'][number]): boolean {
  return membre.typologie === 'Préfecture départementale'
}

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

type Statut = 'candidat' | 'confirme' | 'supprimer'

type Role = 'beneficiaire' | 'cofinanceur' | 'coporteur' | 'observateur' | 'recipiendaire'
