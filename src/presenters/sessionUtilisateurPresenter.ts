import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

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
    telephone: utilisateurReadModel.telephone,
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
  telephone: string
}>
