import { Groupe, TypologieRole } from '@/domain/Role'
import { UtilisateurState } from '@/domain/Utilisateur'

export function createSessionUtilisateurPresenter(
  utilisateurReadModel: UtilisateurState
): SessionUtilisateurViewModel {
  return {
    ...utilisateurReadModel,
    role: {
      groupe: utilisateurReadModel.role.groupe,
      libelle: libelleByRole[utilisateurReadModel.role.nom] ?? utilisateurReadModel.role.territoireOuStructure,
      nom: utilisateurReadModel.role.nom,
      pictogramme: utilisateurReadModel.role.categorie,
    },
  }
}

export type SessionUtilisateurViewModel = Readonly<{
  email: string
  nom: string
  prenom: string
  role: Readonly<{
    groupe: Groupe
    libelle: string
    nom: TypologieRole
    pictogramme: string
  }>
  uid: string
}>

const libelleByRole: Readonly<Partial<Record<TypologieRole, string>>> = {
  Instructeur: 'Banque des territoires',
  'Pilote politique publique': 'France Numérique Ensemble',
  'Support animation': 'Mednum',
}
