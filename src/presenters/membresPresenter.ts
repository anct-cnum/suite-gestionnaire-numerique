import { membreLink } from './shared/link'
import { RoleViewModel, toRoleViewModel } from './shared/role'
import { isEmpty } from '@/shared/lang'
import { MembreReadModel, MesMembresReadModel } from '@/use-cases/queries/RecupererMesMembres'

export function membresPresenter(mesMembresReadModel: MesMembresReadModel): MembresViewModel {
  return {
    autorisations: mesMembresReadModel.autorisations,
    departement: mesMembresReadModel.departement,
    roles: mesMembresReadModel.roles.map(toRoleViewModel),
    typologies: mesMembresReadModel.typologies.map(handleTypologieIndefinie('simple')),
    ...membresParStatut(mesMembresReadModel.membres, mesMembresReadModel.uidGouvernance),
    uidGouvernance: mesMembresReadModel.uidGouvernance,
  }
}

export type MembresViewModel = Readonly<{
  autorisations: Readonly<{
    accesMembreConfirme: boolean
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
  }>
  candidats: ReadonlyArray<MembreViewModel>
  departement: string
  membres: ReadonlyArray<MembreViewModel>
  roles: ReadonlyArray<RoleViewModel>
  supprimer: ReadonlyArray<MembreViewModel>
  typologies: ReadonlyArray<TypologieViewModel>
  uidGouvernance: string
}>

export type MembreViewModel = Readonly<{
  adresse: string
  contactReferent: {
    email: string
    intitule: string
    intituleCourt: string
  }
  isDeletable: boolean
  link: string
  nom: string
  roles: ReadonlyArray<RoleViewModel>
  siret: string
  statut: string
  suppressionDuMembreAutorise: boolean
  typologie: {
    elaboree: TypologieViewModel
    simple: TypologieViewModel
  }
  uid: string
}>

function membresParStatut(membres: ReadonlyArray<MembreReadModel>, uidGouvernance: string): MembresByStatut {
  return membres.reduce<MembresByStatut>((membresByStatut, membre) => ({
    ...membresByStatut,
    [nomListeMembresParStatut[membre.statut]]: membresByStatut[nomListeMembresParStatut[membre.statut]]
      .concat(toMembreViewModel(membre, uidGouvernance)),
  }), {
    candidats: [],
    membres: [],
    supprimer: [],
  })
}

function toMembreViewModel(membre: MembreReadModel, uidGouvernance: string): MembreViewModel {
  const contactReferent = membre.contactReferent
  const nomComplet = `${contactReferent.prenom} ${contactReferent.nom}`
  return {
    ...membre,
    contactReferent: {
      email: contactReferent.email,
      intitule: `${nomComplet}, ${contactReferent.fonction} ${contactReferent.email}`,
      intituleCourt: nomComplet,
    },
    isDeletable: membre.isDeletable,
    link: membreLink(uidGouvernance, membre.uid),
    roles: membre.roles.map(toRoleViewModel),
    typologie: {
      elaboree: handleTypologieIndefinie('elaboree')(membre.typologie),
      simple: handleTypologieIndefinie('simple')(membre.typologie),
    },
  }
}

function handleTypologieIndefinie(mode: 'elaboree' | 'simple') {
  return (typologie: string): TypologieViewModel => ({
    label: isEmpty(typologie) ? labelTypologieIndefinieByMode[mode] : typologie,
    value: typologie,
  })
}

const labelTypologieIndefinieByMode = {
  elaboree: 'Donnée non fournie',
  simple: 'Autre',
} as const

const nomListeMembresParStatut: Readonly<Record<MembreReadModel['statut'], keyof MembresByStatut>> = {
  candidat: 'candidats',
  confirme: 'membres',
  supprimer: 'supprimer',
}

type MembresByStatut = Pick<MembresViewModel, 'candidats' | 'membres' | 'supprimer'>

type TypologieViewModel = Readonly<{
  label: string
  value: string
}>
