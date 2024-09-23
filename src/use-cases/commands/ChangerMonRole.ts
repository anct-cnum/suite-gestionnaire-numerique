import { CommandHandler, ResultAsync } from './CommandHandler'
import { Role, RoleState } from '@/domain/Role'
import { InvariantUtilisateur, Utilisateur, UtilisateurState } from '@/domain/Utilisateur'

export class ChangerMonRole implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async execute({
    utilisateurState,
    nouveauRoleState,
  }: Command): ResultAsync<InvariantUtilisateur> {
    const utilisateur = new Utilisateur(
      utilisateurState.uid,
      new Role(utilisateurState.role.nom),
      utilisateurState.nom,
      utilisateurState.prenom,
      utilisateurState.email,
      utilisateurState.isSuperAdmin
    )
    const nouveauRole = new Role(nouveauRoleState.nom)
    const result = utilisateur.changerRole(nouveauRole)

    if (result === 'OK') {
      await this.#utilisateurRepository.update(utilisateur)
    }

    return result
  }
}

export interface UtilisateurRepository {
  update: (utilisateur: Utilisateur) => Promise<void>
}

type Command = Readonly<{
  nouveauRoleState: Omit<RoleState, 'categorie' | 'groupe' | 'territoireOuStructure'>
  utilisateurState: Omit<UtilisateurState, 'role'> & { role: Omit<RoleState, 'categorie' | 'groupe' | 'territoireOuStructure'> }
}>
