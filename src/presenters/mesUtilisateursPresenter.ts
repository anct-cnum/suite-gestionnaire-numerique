import { MesUtilisateursReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'

export function mesUtilisateursPresenter(
  mesUtilisateursReadModel: ReadonlyArray<MesUtilisateursReadModel>,
  uid: string,
  pageCourante: number,
  totalUtilisateur: number
): MesUtilisateursViewModel {
  return {
    pageCourante,
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
        structure: monUtilisateur.role.territoireOuStructure,
        telephone: monUtilisateur.telephone || 'Non renseigné',
        uid: monUtilisateur.uid,
      }
    }),
  }
}

export type MesUtilisateursViewModel = Readonly<{
  pageCourante: number
  totalUtilisateur: number
  utilisateurs: ReadonlyArray<MonUtilisateur>
}>

export type MonUtilisateur = Readonly<{
  canBeDeleted: boolean
  derniereConnexion: string
  email: string
  picto: string
  prenomEtNom: string
  role: string
  statut: StatutInscription
  structure: string
  uid: string
  telephone: string
}>

export type DetailsUtilisateurViewModel = Readonly<
  Pick<
    MonUtilisateur, 'prenomEtNom' | 'derniereConnexion' | 'email' | 'role' | 'structure' | 'telephone'
  >
>

export type StatutInscription = 'En attente' | 'Activé'

const inactif = 'inactif'

function buildDate(utilisateurReadModel: MesUtilisateursReadModel): string {
  if (utilisateurReadModel.isActive) {
    return buildDateFrancaise(utilisateurReadModel.derniereConnexion)
  }

  return `invité le ${buildDateFrancaise(utilisateurReadModel.inviteLe)}`
}

function buildDateFrancaise(date: Date): string {
  return date.toLocaleDateString('fr-FR')
}
