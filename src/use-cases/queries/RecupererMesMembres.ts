import { QueryHandler } from '../QueryHandler'
import { UnaryOperator } from '@/shared/lang'

export class RecupererMesMembres implements QueryHandler<Query, MesMembresReadModel> {
  readonly #mesMembresLoader: MesMembresLoader

  constructor(mesMembresLoader: MesMembresLoader) {
    this.#mesMembresLoader = mesMembresLoader
  }

  async get(query: Query): Promise<MesMembresReadModel> {
    return this.#mesMembresLoader.findMesMembres(query.codeDepartement, (mesMembres) => {
      const membres = preFiltrageStatut(mesMembres.membres, query.statut)
      return {
        ...mesMembres,
        filtres: filtresDistinct(membres),
        membres,
        statut: statutDistinct(mesMembres.membres),
      }
    })
  }
}

export abstract class MesMembresLoader {
  async findMesMembres(
    codeDepartement: string,
    filtrations: UnaryOperator<MesMembresReadModel>
  ): Promise<MesMembresReadModel> {
    return this.find(codeDepartement).then(filtrations)
  }

  protected abstract find(codeDepartement: string): Promise<MesMembresReadModel>
}

function preFiltrageStatut(mesMembres: MesMembresReadModel['membres'], statut: Query['statut']): MesMembresReadModel['membres'] {
  return mesMembres.filter((membre) => membre.statut === statut)
}

function filtresDistinct(membres: MesMembresReadModel['membres']): MesMembresReadModel['filtres'] {
  return {
    roles: [...new Set(membres.flatMap((membre) => membre.roles))],
    typologies: [...new Set(membres.flatMap((membre) => membre.typologie))],
  }
}
function statutDistinct(membres: MesMembresReadModel['membres']): MesMembresReadModel['statut'] {
  return [...new Set(membres.map((membre) => membre.statut))]
}

export type MesMembresReadModel = Readonly<{
  autorisations: Readonly<{
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
    accesMembreValide: boolean
  }>
  departement: string
  statut: ReadonlyArray<string>
  filtres: Readonly<{
    roles: ReadonlyArray<string>
    typologies: ReadonlyArray<string>
  }>
  membres: ReadonlyArray<Membre>
}>

type Membre = Readonly<{
  suppressionDuMembreAutorise: boolean
  contactReferent: Readonly<{
    nom: string
    prenom: string
  }>
  nom: string
  statut: string
  roles: ReadonlyArray<string>
  typologie: string
}>

type Query = Readonly<{
  codeDepartement: string
  statut: string
}>

