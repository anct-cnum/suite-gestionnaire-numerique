import { QueryHandler } from '../QueryHandler'
import { identity, UnaryOperator } from '@/shared/lang'

export class RecupererMesMembres implements QueryHandler<Query, MesMembresReadModel> {
  readonly #mesMembresLoader: MesMembresLoader

  constructor(mesMembresLoader: MesMembresLoader) {
    this.#mesMembresLoader = mesMembresLoader
  }

  async get({ codeDepartement }: Query): Promise<MesMembresReadModel> {
    return this.#mesMembresLoader.findMesMembres(codeDepartement, (mesMembres) => {
      const ongletStatut = preFiltrageStatut(mesMembres.membres, mesMembres.statut)
      return {
        ...mesMembres,
        autorisations: {
          ...pouvoirAjouteOuSupprime(mesMembres.roles),
        },
        membres: filtreRolesEtTypologies(ongletStatut, mesMembres.filtre)
          .map((membre: Membre) => eligibleALaSuppression(membre, mesMembres.typologie)),
      }
    })
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
    accesMembreValide: true,
    ajouterUnMembre: estAutotiser,
    supprimerUnMembre: estAutotiser,
  }
}

function preFiltrageStatut(mesMembres: MesMembresReadModel['membres'], statut: MesMembresReadModel['statut']): MesMembresReadModel['membres'] {
  return mesMembres.filter((membre) => membre.statut === statut)
}
function filtreRolesEtTypologies(mesMembres: MesMembresReadModel['membres'], filtre: MesMembresReadModel['filtre']): MesMembresReadModel['membres'] {
  let membresFiltrer = mesMembres
  const toutLesRoles = filtre.roles.includes('')
  const toutLesTypologies = filtre.typologies.includes('')

  if (toutLesRoles && toutLesTypologies) {
    return membresFiltrer
  }
  if (!toutLesRoles) {
    membresFiltrer = membresFiltrer.filter((membre) => membre.roles.some((role) => filtre.roles.includes(role)))
  }

  if (!toutLesTypologies) {
    membresFiltrer = membresFiltrer.filter(
      (membre) => filtre.typologies.some((typologie) => typologie === membre.typologie)
    )
  }

  return membresFiltrer
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
    accesMembreValide: boolean
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
  statut: string
}>

type Statut = 'Membre' | 'Suggestion' | 'Candidat'

type Roles = 'Co-porteur' | 'Co-financeur' | 'Bénéficiaire' | 'Récipiendaire' | 'Observateur'
