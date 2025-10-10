import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetUtilisateurRepository, UpdateDepartementUtilisateurRepository } from './shared/UtilisateurRepository'
import { UtilisateurFailure } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class ChangerMonDepartement implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)
    const result = utilisateurCourant.changerDepartement()
    if (isOk(result)) {
      await this.#utilisateurRepository.updateDepartement(command.uidUtilisateurCourant, command.nouveauCodeDepartement)
    }

    return result
  }
}

type Failure = UtilisateurFailure

type Command = Readonly<{
  nouveauCodeDepartement: string
  uidUtilisateurCourant: string
}>

interface UtilisateurRepository extends GetUtilisateurRepository, UpdateDepartementUtilisateurRepository {}
