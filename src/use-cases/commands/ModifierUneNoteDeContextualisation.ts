import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRouteFailure  } from '@/domain/FeuilleDeRoute'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class ModifierUneNoteDeContextualisation implements CommandHandler<Command> {
  readonly #date: Date
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    utilisateurRepository: UtilisateurRepository,
    date: Date
  ) {
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)
    if (!feuilleDeRoute.peutEtreGereePar(editeur)) {
      return 'utilisateurNePeutPasModifierNoteDeContextualisation'
    }
    const result = feuilleDeRoute.modifierUneNoteDeContextualisation(
      command.contenu,
      this.#date,
      new UtilisateurUid(editeur.state.uid)
    )
    if (!isOk(result)) {
      return result
    }
    await this.#feuilleDeRouteRepository.update(feuilleDeRoute)
    return result
  }
}

interface FeuilleDeRouteRepository extends GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository { }

type Command = Readonly<{
  contenu: string
  uidEditeur: string
  uidFeuilleDeRoute: string
}>

type UtilisateurRepository = GetUtilisateurRepository

type Failure = 'utilisateurNePeutPasModifierNoteDeContextualisation' | FeuilleDeRouteFailure
