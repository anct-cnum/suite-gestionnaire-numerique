import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { TypologieRole } from '@/domain/Role'
import { InvariantUtilisateur } from '@/domain/Utilisateur'

export class ChangerMonRole implements CommandHandler<Command> {
  readonly #repository: Repository

  constructor(repository: Repository) {
    this.#repository = repository
  }

  async execute({ nouveauRole, utilisateurUid }: Command): ResultAsync<ChangerMonRoleFailure> {
    const utilisateur = await this.#repository.find(utilisateurUid)
    if (!utilisateur) {
      return 'compteInexistant'
    }
    const result = utilisateur.changerRole(nouveauRole)
    if (result === 'OK') {
      await this.#repository.update(utilisateur)
    }
    return result
  }
}

export type ChangerMonRoleFailure = InvariantUtilisateur | 'compteInexistant'

type Command = Readonly<{
  nouveauRole: TypologieRole,
  utilisateurUid: string,
}>

interface Repository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
