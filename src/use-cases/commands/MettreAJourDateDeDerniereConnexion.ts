import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { UtilisateurFailure } from '@/domain/Utilisateur'

export class MettreAJourDateDeDerniereConnexion implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #date: Date

  constructor(utilisateurRepository: UtilisateurRepository, date: Date) {
    this.#utilisateurRepository = utilisateurRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)
    utilisateurCourant.changerDateDeDerniereConnexion(this.#date)
    await this.#utilisateurRepository.update(utilisateurCourant)
    return 'OK'
  }
}

type Failure = 'dateInvalide' | UtilisateurFailure

type Command = Readonly<{
  uidUtilisateurCourant: string
}>

interface UtilisateurRepository extends GetUtilisateurRepository, UpdateUtilisateurRepository {}
