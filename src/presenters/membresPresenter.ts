import { toRoleViewModel, RoleViewModel } from './shared/role'
import { isEmpty } from '@/shared/lang'
import { MesMembresReadModel, MembreReadModel } from '@/use-cases/queries/RecupererMesMembres'

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
  departement: string
  autorisations: Readonly<{
    ajouterUnMembre: boolean
    supprimerUnMembre: boolean
    accesMembreConfirme: boolean
  }>
  typologies: ReadonlyArray<TypologieViewModel>
  roles: ReadonlyArray<RoleViewModel>
  membres: ReadonlyArray<MembreViewModel>
  candidats: ReadonlyArray<MembreViewModel>
  suggeres: ReadonlyArray<MembreViewModel>
  uidGouvernance: string
}>

export type MembreViewModel = Readonly<{
  adresse: string
  contactReferent: {
    intitule: string
    intituleCourt: string
  }
  nom: string
  roles: ReadonlyArray<RoleViewModel>
  siret: string
  suppressionDuMembreAutorise: boolean
  typologie: {
    simple: TypologieViewModel
    elaboree: TypologieViewModel
  }
  uid: string
  statut: string
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
    roles: membre.roles.map(toRoleViewModel),
    typologie: {
      elaboree: handleTypologieIndefinie('elaboree')(membre.typologie),
      simple: handleTypologieIndefinie('simple')(membre.typologie),
    },
  }
}

function handleTypologieIndefinie(mode: 'simple' | 'elaboree') {
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

type MembresByStatut = Pick<MembresViewModel, 'membres' | 'suggeres' | 'candidats'>

type TypologieViewModel = Readonly<{
  label: string
  value: string
}>
