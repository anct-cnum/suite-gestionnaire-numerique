import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetUtilisateurRepository, UpdateStructureUtilisateurRepository } from './shared/UtilisateurRepository'
import { UtilisateurFailure } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class ChangerMaStructure implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)
    const result = utilisateurCourant.changerStructure()
    if (isOk(result)) {
      await this.#utilisateurRepository.updateStructure(command.uidUtilisateurCourant, command.idStructure)
    }

    return result
  }
}

type Failure = UtilisateurFailure

type Command = Readonly<{
  idStructure: null | number
  uidUtilisateurCourant: string
}>

interface UtilisateurRepository extends GetUtilisateurRepository, UpdateStructureUtilisateurRepository {}
