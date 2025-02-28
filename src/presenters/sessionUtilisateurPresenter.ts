import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export function createSessionUtilisateurPresenter(
  utilisateurReadModel: UnUtilisateurReadModel
): SessionUtilisateurViewModel {
  const role = utilisateurReadModel.role
  return {
    codeDepartement: utilisateurReadModel.departementCode,
    displayLiensGouvernance: utilisateurReadModel.isGestionnaireDepartement,
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
    },
    telephone: utilisateurReadModel.telephone,
    uid: utilisateurReadModel.uid,
  }
}

export type SessionUtilisateurViewModel = Readonly<{
  codeDepartement: string | null
  displayLiensGouvernance: boolean
  peutChangerDeRole: boolean
  email: string
  nom: string
  prenom: string
  role: Readonly<{
    doesItBelongToGroupeAdmin: boolean
    libelle: string
    nom: string
    pictogramme: string
    rolesGerables: ReadonlyArray<string>
  }>
  telephone: string
  uid: string
}>
