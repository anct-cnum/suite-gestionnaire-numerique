import { QueryHandler } from '../QueryHandler'
import { identity, UnaryOperator } from '@/shared/lang'

export class RecupererMesMembres implements QueryHandler<Query, MesMembresReadModel> {
  readonly #mesMembresLoader: MesMembresLoader

  constructor(mesMembresLoader: MesMembresLoader) {
    this.#mesMembresLoader = mesMembresLoader
  }

  async get(query: Query): Promise<MesMembresReadModel> {
    return this.#mesMembresLoader.findMesMembres(query.codeDepartement, (mesMembres) => ({
      ...mesMembres,
      autorisations: {
        ...pouvoirAjouteOuSupprime(mesMembres.roles),
      },
      membres: mesMembres.membres.map((membre: Membre) => eligibleALaSuppression(membre, mesMembres.typologie)),
    }))
  }
}

export abstract class MesMembresLoader {
  async findMesMembres(
    codeDepartement: string,
    autorisations: UnaryOperator<MesMembresReadModel> = identity
  ): Promise<MesMembresReadModel> {
    return this.find(codeDepartement).then(autorisations)
  }

  protected abstract find(codeDepartement: string): Promise<MesMembresReadModel>
}

function pouvoirAjouteOuSupprime(roles: MesMembresReadModel['roles']): MesMembresReadModel['autorisations'] {
  const rolesAutoriser = ['Co-porteur']
  const estAutotiser = roles.some((role) => rolesAutoriser.includes(role))
  return {
    ajouterUnMembre: estAutotiser,
    supprimerUnMembre: estAutotiser,
  }
}

function eligibleALaSuppression(membre: Membre, typeMembreConnecter: string): Membre {
  return {
    ...membre,
    suppressionDuMembreAutorise: typeMembreConnecter !== membre.typologie,
  }
}

export type MesMembresReadModel = Readonly<{
  autorisations: Readonly<{
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
  }>
  roles: ReadonlyArray<string>
  departement: string
  statut: Statut
  filtre: Readonly<{
    roles: ReadonlyArray<Roles | ''>
    typologies: ReadonlyArray<string>
  }>
  membres: ReadonlyArray<Membre>
  typologie: string
  uid: string
}>

type Membre = Readonly<{
  suppressionDuMembreAutorise: boolean
  contactReferent: Readonly<{
    nom: string
    prenom: string
  }>
  nom: string
  statut: Statut
  roles: ReadonlyArray<Roles>
  typologie: string
}>

type Query = Readonly<{
  codeDepartement: string
}>

type Statut = 'Membre' | 'Suggestion' | 'Candidat'

type Roles = 'Co-porteur' | 'Co-financeur' | 'Bénéficiaire' | 'Récipiendaire' | 'Observateur'
