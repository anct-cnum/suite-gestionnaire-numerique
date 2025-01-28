import { QueryHandler } from '../QueryHandler'
import { identity, UnaryOperator } from '@/shared/lang'

export class RecupererMesMembres implements QueryHandler<Query, MesMembresReadModel> {
  readonly #mesMembresLoader: MesMembresReadModelLoader

  constructor(mesMembresLoader: MesMembresReadModelLoader) {
    this.#mesMembresLoader = mesMembresLoader
  }

  async get({ codeDepartementGouvernance }: Query): Promise<MesMembresReadModel> {
    return this.#mesMembresLoader.findMesMembres(codeDepartementGouvernance, (mesMembres) => ({
      ...mesMembres,
      autorisations: {
        ...pouvoirAjouteOuSupprime(mesMembres.roles),
      },
      membres: mesMembres.membres.map((membre: Membre) => eligibleALaSuppression(membre, mesMembres.typologieMembre)),
    }))
  }
}

export abstract class MesMembresReadModelLoader {
  async findMesMembres(
    codeDepartementGouvernance: string,
    autorisations: UnaryOperator<MesMembresReadModel> = identity
  ): Promise<MesMembresReadModel> {
    return this.find(codeDepartementGouvernance).then(autorisations)
  }

  protected abstract find(codeDepartementGouvernance: string): Promise<MesMembresReadModel>
}

function pouvoirAjouteOuSupprime(roles: MesMembresReadModel['roles']): MesMembresReadModel['autorisations'] {
  const rolesAutoriser = ['Co-porteur']
  return {
    ...roles.some((role) => rolesAutoriser.includes(role)) &&
      {
        AjouterUnMembre: true,
        SupprimerUnMembre: true,
      },
  }
}

function eligibleALaSuppression(membre: Membre, typeMembreConnecter: string): Membre {
  return {
    ...membre,
    ...typeMembreConnecter === membre.typologieMembre && { suppressionDuMembreNonAutorise: true },
  }
}

export type MesMembresReadModel = Readonly<{
  autorisations: Readonly<{
    AjouterUnMembre?: boolean
    SupprimerUnMembre?: boolean
  }>
  roles: ReadonlyArray<string>
  departement: string
  filtre: Readonly<{
    roles: ReadonlyArray<Roles | ''>
    statut: Statut
    typologie: string
  }>
  membres: ReadonlyArray<Membre>
  typologieMembre: string
  uid: string
}>

type Membre = Readonly<{
  suppressionDuMembreNonAutorise?: boolean
  contactReferent: Readonly<{
    nom: string
    prenom: string
  }>
  nom: string
  statut: Statut
  roles: ReadonlyArray<Roles>
  typologieMembre: string
}>

type Query = Readonly<{
  codeDepartementGouvernance: string
}>

type Statut = 'Membre' | 'Suggestion' | 'Candidat'

type Roles = 'Co-porteur' | 'Co-financeur' | 'Bénéficiaire' | 'Récipiendaire' | 'Observateur'
