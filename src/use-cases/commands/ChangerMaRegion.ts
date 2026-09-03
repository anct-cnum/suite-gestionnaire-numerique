import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetUtilisateurRepository, UpdateRegionUtilisateurRepository } from './shared/UtilisateurRepository'
import { UtilisateurFailure } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class ChangerMaRegion implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)
    const result = utilisateurCourant.changerRegion()
    if (isOk(result)) {
      // Contrairement au changement de département, la structure de rattachement est laissée telle
      // quelle : un SGAR peut ne pas avoir de structure (décision PO #1279), et la conserver permet
      // de tester les droits co-porteur via la structure courante.
      await this.#utilisateurRepository.updateRegion(command.uidUtilisateurCourant, command.nouveauCodeRegion)
    }

    return result
  }
}

type Failure = UtilisateurFailure

type Command = Readonly<{
  nouveauCodeRegion: string
  uidUtilisateurCourant: number
}>

interface UtilisateurRepository extends GetUtilisateurRepository, UpdateRegionUtilisateurRepository {}
