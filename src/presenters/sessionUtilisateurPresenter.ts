import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export function createSessionUtilisateurPresenter(
  utilisateurReadModel: UnUtilisateurReadModel
): SessionUtilisateurViewModel {
  const role = utilisateurReadModel.role
  return {
    email: utilisateurReadModel.email,
    isSuperAdmin: utilisateurReadModel.isSuperAdmin,
    nom: utilisateurReadModel.nom,
    prenom: utilisateurReadModel.prenom,
    role: {
      groupe: role.groupe,
      libelle: role.organisation,
      nom: role.nom,
      pictogramme: role.categorie,
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
