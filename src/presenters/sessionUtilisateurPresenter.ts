import { RoleUtilisateur, UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export function createSessionUtilisateurPresenter(
  utilisateurReadModel: UnUtilisateurReadModel
): SessionUtilisateurViewModel {
  const role = utilisateurReadModel.role
  return {
    codeDepartement: utilisateurReadModel.departementCode,
    displayLiensGouvernance: utilisateurReadModel.displayMenusPilotage,
    email: utilisateurReadModel.email,
    nom: utilisateurReadModel.nom,
    peutChangerDeRole: utilisateurReadModel.isSuperAdmin,
    prenom: utilisateurReadModel.prenom,
    role: {
      doesItBelongToGroupeAdmin: role.doesItBelongToGroupeAdmin,
      libelle: role.organisation,
      nom: role.nom,
      pictogramme: role.categorie,
      rolesGerables: role.rolesGerables,
      type: role.type,
    },
    telephone: utilisateurReadModel.telephone,
    uid: utilisateurReadModel.uid,
  }
}

export type SessionUtilisateurViewModel = Readonly<{
  codeDepartement: null | string
  displayLiensGouvernance: boolean
  email: string
  nom: string
  peutChangerDeRole: boolean
  prenom: string
  role: Readonly<{
    doesItBelongToGroupeAdmin: boolean
    libelle: string
    nom: string
    pictogramme: string
    rolesGerables: ReadonlyArray<string>
    type: RoleUtilisateur
  }>
  telephone: string
  uid: string
}>
