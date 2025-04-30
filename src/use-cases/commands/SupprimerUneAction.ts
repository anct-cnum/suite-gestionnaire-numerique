import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropActionRepository, GetActionRepository } from './shared/ActionRepository'
import { GetFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { ActionUid } from '@/domain/Action'

export class SupprimerUneAction implements CommandHandler<Command> {
  readonly #actionRepository: ActionRepository
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #utilisateurRepository: UtilisateurRepository
  // Ajouter les autres repository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    actionRepository: ActionRepository
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#actionRepository = actionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const gestionnaire = await this.#utilisateurRepository.get(command.uidGestionnaire)
    const action = await this.#actionRepository.get(new ActionUid(command.uidAction))
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(action.state.uidFeuilleDeRoute)
    if (!feuilleDeRoute.peutEtreGereePar(gestionnaire)) {
      return 'suppressionActionNonAutorisee'
    }
    // if (action.existeDemandeSubventionClos()) {
    //   return 'conflitExisteSubventionClos'
    // }

    await this.#actionRepository.drop(action)

    return 'OK'
  }
}

type Failure = 'conflitExisteSubventionClos' | 'suppressionActionNonAutorisee'
type Command = Readonly<{
  uidAction: string
  uidGestionnaire: string
}>

type UtilisateurRepository = GetUtilisateurRepository

type FeuilleDeRouteRepository = GetFeuilleDeRouteRepository

type ActionRepository = DropActionRepository & GetActionRepository
