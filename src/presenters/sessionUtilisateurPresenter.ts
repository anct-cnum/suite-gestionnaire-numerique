import { TerritoireReadModel } from '@/use-cases/queries/RecupererTerritoireUtilisateur'
import { RoleUtilisateur, UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export function createSessionUtilisateurPresenter(
  utilisateurReadModel: UnUtilisateurReadModel,
  territoire: TerritoireReadModel
): SessionUtilisateurViewModel {
  const role = utilisateurReadModel.role
  return {
    codeDepartement: territoire.codes[0] ?? null,
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
    structureId: utilisateurReadModel.structureId,
    telephone: utilisateurReadModel.telephone,
    territoire,
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
  structureId: null | number
  telephone: string
  territoire: TerritoireReadModel
  uid: string
}>
