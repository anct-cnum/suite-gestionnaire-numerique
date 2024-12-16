import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '@/domain/Role'
import { UtilisateurFailure } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class ChangerMonRole implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async execute(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.find(command.uidUtilisateurCourant)
    if (!utilisateurCourant) {
      return 'utilisateurCourantInexistant'
    }

    const result = utilisateurCourant.changerRole(command.nouveauRole)
    if (isOk(result)) {
      await this.#utilisateurRepository.update(utilisateurCourant)
    }

    return result
  }
}

type Failure = UtilisateurFailure | 'utilisateurCourantInexistant'

type Command = Readonly<{
  nouveauRole: TypologieRole
  uidUtilisateurCourant: string
}>

interface UtilisateurRepository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
