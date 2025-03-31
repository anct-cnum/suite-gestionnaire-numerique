import { RoleViewModel, toRoleViewModel } from './shared/role'
import { isEmpty } from '@/shared/lang'
import { MembreReadModel, MesMembresReadModel } from '@/use-cases/queries/RecupererMesMembres'

export function membresPresenter(mesMembresReadModel: MesMembresReadModel): MembresViewModel {
  return {
    autorisations: mesMembresReadModel.autorisations,
    departement: mesMembresReadModel.departement,
    roles: mesMembresReadModel.roles.map(toRoleViewModel),
    typologies: mesMembresReadModel.typologies.map(handleTypologieIndefinie('simple')),
    ...membresParStatut(mesMembresReadModel.membres),
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
  suggeres: ReadonlyArray<MembreViewModel>
  typologies: ReadonlyArray<TypologieViewModel>
  uidGouvernance: string
}>

export type MembreViewModel = Readonly<{
  adresse: string
  contactReferent: {
    intitule: string
    intituleCourt: string
  }
  isDeletable: boolean
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

function membresParStatut(membres: ReadonlyArray<MembreReadModel>): MembresByStatut {
  return membres.reduce<MembresByStatut>((membresByStatut, membre) => ({
    ...membresByStatut,
    [nomListeMembresParStatut[membre.statut]]: membresByStatut[nomListeMembresParStatut[membre.statut]]
      .concat(toMembreViewModel(membre)),
  }), {
    candidats: [],
    membres: [],
    suggeres: [],
  })
}

function toMembreViewModel(membre: MembreReadModel): MembreViewModel {
  const contactReferent = membre.contactReferent
  const nomComplet = `${contactReferent.prenom} ${contactReferent.nom}`
  return {
    ...membre,
    contactReferent: {
      intitule: `${nomComplet}, ${contactReferent.fonction} ${contactReferent.email}`,
      intituleCourt: nomComplet,
    },
    isDeletable: membre.typologie === 'Préfecture départementale',
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
  suggere: 'suggeres',
}

type MembresByStatut = Pick<MembresViewModel, 'candidats' | 'membres' | 'suggeres'>

type TypologieViewModel = Readonly<{
  label: string
  value: string
}>
