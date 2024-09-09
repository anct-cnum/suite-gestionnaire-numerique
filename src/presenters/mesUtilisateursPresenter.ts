import { Categorie, TypologieRole } from '@/domain/Role'
import { UtilisateurReadModel } from '@/use-cases/queries/UtilisateurQuery'

export function mesUtilisateursPresenter(
  mesUtilisateursReadModel: Array<UtilisateurReadModel>,
  sub: string,
  pageCourante: number,
  totalUtilisateur: number
): MesUtilisateursViewModel {
  return {
    pageCourante,
    totalUtilisateur,
    utilisateurs: mesUtilisateursReadModel.map((monUtilisateur): MonUtilisateur => {
      const statut = monUtilisateur.isActive ? 'Activé' : 'En attente'
      const categorie = monUtilisateur.isActive ? monUtilisateur.role.categorie : 'inactif'

      return {
        canBeDeleted: sub !== monUtilisateur.sub,
        categorie,
        derniereConnexion: buildDate(monUtilisateur),
        email: monUtilisateur.email,
        prenomEtNom: `${monUtilisateur.prenom} ${monUtilisateur.nom}`,
        role: monUtilisateur.role.nom,
        statut,
        structure: monUtilisateur.role.territoireOuStructure,
      }
    }),
  }
}

function buildDate(monUtilisateurReadModel: UtilisateurReadModel) {
  if (monUtilisateurReadModel.isActive) {
    return monUtilisateurReadModel.derniereConnexion.toLocaleDateString('fr-FR', options)
  } else {
    return `invité le ${monUtilisateurReadModel.inviteLe.toLocaleDateString('fr-FR', options)}`
  }
}

const options: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
}

export type MesUtilisateursViewModel = Readonly<{
  pageCourante: number
  totalUtilisateur: number
  utilisateurs: ReadonlyArray<MonUtilisateur>
}>

type MonUtilisateur = Readonly<{
  canBeDeleted: boolean
  categorie: Categorie | 'inactif'
  derniereConnexion: string
  email: string
  prenomEtNom: string
  role: TypologieRole
  statut: StatutInscription
  structure: string
}>

export type StatutInscription = 'En attente' | 'Activé'
