import { UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { Role, RoleState } from '@/domain/Role'
import { InvariantUtilisateur, UtilisateurState, Utilisateur } from '@/domain/Utilisateur'

export class ChangerMonRole implements CommandHandler<Command> {
  readonly #utilisateurRepository: UpdateUtilisateurRepository

  constructor(utilisateurRepository: UpdateUtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async execute({
    utilisateurState,
    nouveauRoleState,
  }: Command): ResultAsync<InvariantUtilisateur> {
    const utilisateur = Utilisateur.create({
      email: utilisateurState.email,
      isSuperAdmin: utilisateurState.isSuperAdmin,
      nom: utilisateurState.nom,
      organisation: utilisateurState.role.territoireOuStructure,
      prenom: utilisateurState.prenom,
      role: utilisateurState.role.nom,
      uid: utilisateurState.uid,
    })

    const nouveauRole = new Role(nouveauRoleState.nom)
    const result = utilisateur.changerRole(nouveauRole)

    if (result === 'OK') {
      await this.#utilisateurRepository.update(utilisateur)
    }

    return result
  }
}

type Command = Readonly<{
  nouveauRoleState: Omit<RoleState, 'categorie' | 'groupe'>
  utilisateurState: Omit<UtilisateurState, 'role'> & { role: Omit<RoleState, 'categorie' | 'groupe'> }
}>
