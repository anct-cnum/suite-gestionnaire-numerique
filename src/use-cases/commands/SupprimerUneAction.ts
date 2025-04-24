import { ActionUid } from '@/domain/Action'
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropActionRepository, GetActionRepository } from './shared/ActionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GetFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'

export class SupprimerUneAction implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #actionRepository: ActionRepository
  // Ajouter les autres repository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    actionRepository: ActionRepository,
  ) {
    this.#utilisateurRepository = utilisateurRepository,
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository,
    this.#actionRepository = actionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const gestionnaire = await this.#utilisateurRepository.get(command.uidGestionnaire)
    const action = await this.#actionRepository.get(new ActionUid(command.uidAction))
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(action.state.uidFeuilleDeRoute)
    if (!feuilleDeRoute.peutEtreGereePar(gestionnaire)) {
      return 'suppressionActionNonAutorisee'
    }
    // Todo: A vérifier si correcte pour un le membre co-porteur
    if (!action.peutEtreGereePar(gestionnaire)) {
      return 'ActionNonEligibleALaSuppression'
    }
    // Todo gérer le statut si une subvention est en demande deposee

    await this.#actionRepository.drop(action)

    return 'OK'
  }
}

type Failure = 'suppressionActionNonAutorisee' | 'ActionNonEligibleALaSuppression'
type Command = Readonly<{
  uidAction: string
  uidGestionnaire: string
}>

type UtilisateurRepository = GetUtilisateurRepository

type FeuilleDeRouteRepository = GetFeuilleDeRouteRepository

type ActionRepository = DropActionRepository & GetActionRepository
