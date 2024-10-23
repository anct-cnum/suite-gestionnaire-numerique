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

type MonUtilisateur = DetailsUtilisateurViewModel & Readonly<{
  canBeDeleted: boolean
  picto: string
  statut: 'En attente' | 'Activé'
  uid: string
}>

export type DetailsUtilisateurViewModel = Readonly<{
  derniereConnexion: string
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
