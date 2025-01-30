import { QueryHandler } from '../QueryHandler'
import { UnaryOperator } from '@/shared/lang'

export class RecupererMesMembres implements QueryHandler<Query, MesMembresReadModel> {
  readonly #mesMembresLoader: MesMembresLoader

  constructor(mesMembresLoader: MesMembresLoader) {
    this.#mesMembresLoader = mesMembresLoader
  }

  async get(query: Query): Promise<MesMembresReadModel> {
    return this.#mesMembresLoader.findMesMembres(query.codeDepartement, (mesMembres) => {
      return {
        ...mesMembres,
        ...roleEtTypologieDistinct(mesMembres.membres),
      }
    })
  }
}

export abstract class MesMembresLoader {
  async findMesMembres(
    codeDepartement: string,
    operator: UnaryOperator<MesMembresReadModel>
  ): Promise<MesMembresReadModel> {
    return this.find(codeDepartement).then(operator)
  }

  protected abstract find(codeDepartement: string): Promise<MesMembresReadModel>
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
    accesMembreValide: boolean
  }>
  departement: string
  typologies: ReadonlyArray<string>
  roles: ReadonlyArray<Role>
  membres: ReadonlyArray<Membre>
}>

type Membre = Readonly<{
  suppressionDuMembreAutorise: boolean
  contactReferent: Readonly<{
    nom: string
    prenom: string
  }>
  nom: string
  roles: ReadonlyArray<Role>
  typologie: string
}>

type Query = Readonly<{
  codeDepartement: string
}>

export type Role = 'coporteur' | 'cofinanceur' | 'beneficiaire' | 'recipiendaire' | 'observateur'
