import { UnUtilisateurReadModel } from '@/use-cases/queries/RechercherUnUtilisateur'

export function createSessionUtilisateurPresenter(
  utilisateurReadModel: UnUtilisateurReadModel
): SessionUtilisateurViewModel {
  return {
    email: utilisateurReadModel.email,
    isSuperAdmin: utilisateurReadModel.isSuperAdmin,
    nom: utilisateurReadModel.nom,
    prenom: utilisateurReadModel.prenom,
    role: {
      groupe: utilisateurReadModel.role.groupe,
      libelle: utilisateurReadModel.role.territoireOuStructure,
      nom: utilisateurReadModel.role.nom,
      pictogramme: utilisateurReadModel.role.categorie,
    },
    uid: utilisateurReadModel.uid,
  }
}

export type SessionUtilisateurViewModel = Readonly<{
  email: string
  isSuperAdmin: boolean
  nom: string
  prenom: string
  role: Readonly<{
    groupe: string
    libelle: string
    nom: string
    pictogramme: string
  }>
  uid: string
}>
