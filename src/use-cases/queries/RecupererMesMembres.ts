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
      membres:
        cleanMembre(mesMembres.membres.values()
          // .map((membre: Membre) => pouvoirFiltrerParRoleEtTypologie(membre, mesMembres.filtre))
          .map((membre: Membre) => eligibleALaSuppression(membre, mesMembres.typologieMembre))
          .toArray(),
        mesMembres.filtre),
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

function cleanMembre(membres: MesMembresReadModel['membres'], filtre: MesMembresReadModel['filtre']): MesMembresReadModel['membres'] {
  const membre = membres.map((membre) => pouvoirFiltrerParRoleEtTypologie(membre, filtre))
  return membre.filter((membre) => membre !== undefined)
}

function pouvoirFiltrerParRoleEtTypologie(membre: Membre, filtre: MesMembresReadModel['filtre']): Membre | undefined {
  const matchRolesSelectionner = membre.roles.some((role) => filtre.roles.includes(role)) && !filtre.roles.includes('')
  if (membre.statut === filtre.statut && filtre.roles.includes('') && filtre.typologie === '' && membre.statut === filtre.statut) {
    // filtre par default
    return membre
  }
  if (matchRolesSelectionner && filtre.typologie === membre.typologieMembre && membre.statut === filtre.statut) {
    // filtre sur la typologie
    return membre
  }
  if (matchRolesSelectionner && filtre.typologie === '' && membre.statut === filtre.statut) {
    // filtre uniquement sur le role
    return membre
  }
  return undefined
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
