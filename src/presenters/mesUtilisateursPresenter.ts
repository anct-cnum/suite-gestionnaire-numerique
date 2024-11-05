import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export function mesUtilisateursPresenter(
  mesUtilisateursReadModel: ReadonlyArray<UnUtilisateurReadModel>,
  uid: string,
  totalUtilisateur: number
): MesUtilisateursViewModel {
  return {
    totalUtilisateur,
    utilisateurs: mesUtilisateursReadModel.map((monUtilisateur): MonUtilisateur => {
      const [statut, picto] = monUtilisateur.isActive
        ? ['Activé', monUtilisateur.role.categorie] as const
        : ['En attente', inactif] as const

      return {
        canBeDeleted: uid !== monUtilisateur.uid,
        derniereConnexion: buildDate(monUtilisateur),
        email: monUtilisateur.email,
        inviteLe: buildDateFrancaiseEnAttente(monUtilisateur.inviteLe),
        picto,
        prenomEtNom: `${monUtilisateur.prenom} ${monUtilisateur.nom}`,
        role: monUtilisateur.role.nom,
        statut,
        structure: monUtilisateur.role.organisation,
        telephone: monUtilisateur.telephone || 'Non renseigné',
        uid: monUtilisateur.uid,
      }
    }),
  }
}

export type MesUtilisateursViewModel = Readonly<{
  totalUtilisateur: number
  utilisateurs: ReadonlyArray<MonUtilisateur>
}>

export type MonUtilisateur = DetailsUtilisateurViewModel & Readonly<{
  canBeDeleted: boolean
  picto: string
  statut: 'En attente' | 'Activé'
  uid: string
}>

export type DetailsUtilisateurViewModel = Readonly<{
  derniereConnexion: string
  inviteLe: string
  email: string
  prenomEtNom: string
  role: string
  structure: string
  telephone: string
}>

const inactif = 'inactif'

function buildDate(utilisateurReadModel: UnUtilisateurReadModel): string {
  if (utilisateurReadModel.isActive) {
    return buildDateFrancaise(utilisateurReadModel.derniereConnexion)
  }

  return `invité le ${buildDateFrancaise(utilisateurReadModel.inviteLe)}`
}

function buildDateFrancaise(date: Date): string {
  return date.toLocaleDateString('fr-FR')
}

function buildDateFrancaiseEnAttente(date: Date): string {
  const now = new Date()
  const today = buildDateFrancaise(now)
  const yesterday = buildDateFrancaise(new Date(now.setDate(now.getDate() - 1)))

  if (buildDateFrancaise(date) === today) {
    return 'Invitation envoyée aujourd’hui'
  }

  if (buildDateFrancaise(date) === yesterday) {
    return 'Invitation envoyée hier'
  }

  return `Invitation envoyée le ${buildDateFrancaise(date)}`
}
