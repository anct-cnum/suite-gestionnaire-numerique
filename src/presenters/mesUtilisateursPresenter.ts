import { Categorie, TypologieRole } from '@/domain/Role'
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
        : ['En attente', 'inactif'] as const

      return {
        canBeDeleted: uid !== monUtilisateur.uid,
        derniereConnexion: buildDate(monUtilisateur),
        email: monUtilisateur.email,
        picto,
        prenomEtNom: `${monUtilisateur.prenom} ${monUtilisateur.nom}`,
        role: monUtilisateur.role.nom,
        statut,
        structure: monUtilisateur.role.territoireOuStructure,
      }
    }),
  }
}

function buildDate(utilisateurReadModel: MesUtilisateursReadModel): string {
  if (utilisateurReadModel.isActive) {
    return buildDateFrancaise(utilisateurReadModel.derniereConnexion)
  }

  return `invité le ${buildDateFrancaise(utilisateurReadModel.inviteLe)}`
}

function buildDateFrancaise(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }

  return date.toLocaleDateString('fr-FR', options)
}

export type MesUtilisateursViewModel = Readonly<{
  pageCourante: number
  totalUtilisateur: number
  utilisateurs: ReadonlyArray<MonUtilisateur>
}>

type MonUtilisateur = Readonly<{
  canBeDeleted: boolean
  derniereConnexion: string
  email: string
  picto: Categorie | 'inactif'
  prenomEtNom: string
  role: TypologieRole
  statut: StatutInscription
  structure: string
}>

export type StatutInscription = 'En attente' | 'Activé'
