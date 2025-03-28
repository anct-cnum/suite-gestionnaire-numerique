import { formaterEnDateFrancaise } from './shared/date'
import config from '@/use-cases/config.json'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export function mesUtilisateursPresenter(
  mesUtilisateursReadModel: ReadonlyArray<UnUtilisateurReadModel>,
  uid: string,
  totalUtilisateur: number,
  rolesAvecStructure: RolesAvecStructure,
  now: Date
): MesUtilisateursViewModel {
  return {
    displayPagination: totalUtilisateur > config.utilisateursParPage,
    rolesAvecStructure,
    totalUtilisateur,
    utilisateurs: mesUtilisateursReadModel.map((monUtilisateur): MonUtilisateur => {
      const [statut, couleur, picto] = monUtilisateur.isActive
        ? ['Activé', 'success', monUtilisateur.role.categorie] as const
        : ['En attente', 'grey-main', inactif] as const
      const [color, isDisabled] = uid === monUtilisateur.uid
        ? ['color-grey', false] as const
        : ['color-red', true] as const

      return {
        deleteButton: {
          color,
          isDisabled,
        },
        derniereConnexion: buildDate(monUtilisateur),
        emailDeContact: monUtilisateur.email,
        inviteLe: buildDateFrancaiseEnAttente(monUtilisateur.inviteLe, now),
        isActif: monUtilisateur.isActive,
        picto,
        prenomEtNom: `${monUtilisateur.prenom} ${monUtilisateur.nom}`,
        role: monUtilisateur.role.nom,
        statut: {
          couleur,
          libelle: statut,
        },
        structure: monUtilisateur.role.organisation,
        telephone: monUtilisateur.telephone || 'Non renseigné',
        uid: monUtilisateur.uid,
      }
    }),
  }
}

export type MesUtilisateursViewModel = Readonly<{
  displayPagination: boolean
  rolesAvecStructure: RolesAvecStructure
  totalUtilisateur: number
  utilisateurs: ReadonlyArray<MonUtilisateur>
}>

export type MonUtilisateur = DetailsUtilisateurViewModel & Readonly<{
  deleteButton: Readonly<{
    color: 'color-grey' | 'color-red'
    isDisabled: boolean
  }>
  isActif: boolean
  picto: string
  statut: Readonly<{
    couleur: 'grey-main' | 'success'
    libelle: 'Activé' | 'En attente'
  }>
  uid: string
}>

export type DetailsUtilisateurViewModel = Readonly<{
  derniereConnexion: string
  emailDeContact: string
  inviteLe: string
  prenomEtNom: string
  role: string
  structure: string
  telephone: string
}>

export type RolesAvecStructure = Readonly<Record<string, {
  label: string
  options: ReadonlyArray<{
    label: string
    value: string
  }>
  placeholder: string
}>>

const inactif = 'inactif'

function buildDate(utilisateurReadModel: UnUtilisateurReadModel): string {
  if (utilisateurReadModel.isActive) {
    return formaterEnDateFrancaise(utilisateurReadModel.derniereConnexion)
  }

  return `invité le ${formaterEnDateFrancaise(utilisateurReadModel.inviteLe)}`
}

function buildDateFrancaiseEnAttente(dateDInvitation: Date, now: Date): string {
  const today = formaterEnDateFrancaise(now)
  const invitationDate = formaterEnDateFrancaise(dateDInvitation)
  const yesterday = formaterEnDateFrancaise(new Date(new Date(now).setDate(new Date(now).getDate() - 1)))

  if (invitationDate === today) {
    return 'Invitation envoyée aujourd’hui'
  }

  if (invitationDate === yesterday) {
    return 'Invitation envoyée hier'
  }

  return `Invitation envoyée le ${invitationDate}`
}
