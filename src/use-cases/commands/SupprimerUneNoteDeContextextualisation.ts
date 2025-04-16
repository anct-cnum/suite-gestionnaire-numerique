import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRouteUid } from '@/domain/FeuilleDeRoute'

export class SupprimerUneNoteDeContextualisation implements CommandHandler<Command> {
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    utilisateurRepository: UtilisateurRepository
  ) {
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(new FeuilleDeRouteUid(command.uidFeuilleDeRoute))
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)

    if (!feuilleDeRoute.peutEtreGereePar(editeur)) {
      return 'editeurNePeutPasSupprimerNoteDeContextualisation'
    }

    feuilleDeRoute.supprimerNoteDeContextextualisation()

    await this.#feuilleDeRouteRepository.update(feuilleDeRoute)

    return 'OK'
  }
}

type Failure = 'editeurNePeutPasSupprimerNoteDeContextualisation'

type Command = Readonly<{
  uidEditeur: string
  uidFeuilleDeRoute: string
}>

interface FeuilleDeRouteRepository extends GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository { }

type UtilisateurRepository = GetUtilisateurRepository
