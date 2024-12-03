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
    prenom: utilisateurReadModel.prenom,
    role: {
      groupe: role.groupe,
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
  email: string
  displayLiensGouvernance: boolean
  nom: string
  prenom: string
  role: Readonly<{
    groupe: string
    libelle: string
    nom: string
    pictogramme: string
    rolesGerables: ReadonlyArray<string>
  }>
  telephone: string
  uid: string
}>
