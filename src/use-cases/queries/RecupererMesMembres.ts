import { QueryHandler } from '../QueryHandler'
import { UnaryOperator } from '@/shared/lang'

export class RecupererMesMembres implements QueryHandler<Query, MesMembresReadModel> {
  readonly #mesMembresLoader: MesMembresLoader

  constructor(mesMembresLoader: MesMembresLoader) {
    this.#mesMembresLoader = mesMembresLoader
  }

  async get(query: Query): Promise<MesMembresReadModel> {
    return this.#mesMembresLoader.findMesMembres(query.codeDepartement, (mesMembres) => {
      const membres = statutsDisponibles(mesMembres.membres, query.statut)
      return {
        ...mesMembres,
        ...roleEtTypologieDistinct(membres),
        membres,
        statuts: statutDistinct(mesMembres.membres),
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

function statutsDisponibles(mesMembres: MesMembresReadModel['membres'], statut: Query['statut']): MesMembresReadModel['membres'] {
  return mesMembres.filter((membre) => membre.statut === statut)
}

function roleEtTypologieDistinct(membres: MesMembresReadModel['membres']): { roles: MesMembresReadModel['roles']; typologies: MesMembresReadModel['typologies'] } {
  return {
    roles: [...new Set(membres.flatMap(({ roles }) => roles))],
    typologies: [...new Set(membres.flatMap(({ typologie }) => typologie))],
  }
}

function statutDistinct(membres: MesMembresReadModel['membres']): MesMembresReadModel['statuts'] {
  return [...new Set(membres.map(({ statut }) => statut))]
}

export type MesMembresReadModel = Readonly<{
  autorisations: Readonly<{
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
    accesMembreValide: boolean
  }>
  departement: string
  typologies: ReadonlyArray<string>
  statuts: ReadonlyArray<Statuts>
  roles: ReadonlyArray<Roles>
  membres: ReadonlyArray<Membre>
}>

type Membre = Readonly<{
  suppressionDuMembreAutorise: boolean
  contactReferent: Readonly<{
    nom: string
    prenom: string
  }>
  nom: string
  statut: Statuts
  roles: ReadonlyArray<Roles>
  typologie: string
}>

type Query = Readonly<{
  codeDepartement: string
  statut: string
}>

type Statuts = 'membre' | 'suggestion' | 'candidat'

type Roles = 'coporteur' | 'cofinanceur' | 'beneficiaire' | 'recipiendaire' | 'observateur'
