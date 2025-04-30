import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropActionRepository, GetActionRepository } from './shared/ActionRepository'
import { DropCoFinancementRepository } from './shared/CoFinancementRepository'
import { DropDemandeDeSubventionRepository, GetDemandeDeSubventionRepository } from './shared/DemandeDeSubventionRepository'
import { GetFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { ActionUid } from '@/domain/Action'

export class SupprimerUneAction implements CommandHandler<Command> {
  readonly #actionRepository: ActionRepository
  readonly #coFinancementRepository: CoFinancementRepository
  readonly #demandeDeSubventionRepository: DemandeDeSubventionRepository
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    actionRepository: ActionRepository,
    demandeDeSubventionRepository: DemandeDeSubventionRepository,
    coFinancementRepository: CoFinancementRepository
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#actionRepository = actionRepository
    this.#demandeDeSubventionRepository = demandeDeSubventionRepository
    this.#coFinancementRepository = coFinancementRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const gestionnaire = await this.#utilisateurRepository.get(command.uidGestionnaire)
    const action = await this.#actionRepository.get(new ActionUid(command.uidAction).state.value)
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(action.state.uidFeuilleDeRoute)
    const demandesDeSubvention = await this.#demandeDeSubventionRepository.get(action.state.uid.value)
    if (!feuilleDeRoute.peutEtreGereePar(gestionnaire)) {
      return 'suppressionActionNonAutorisee'
    }
    if (demandesDeSubvention.estUneDemandeSubventionEnCoursOuClos()) {
      return 'conflitExisteSubventionClos'
    }

    await this.#actionRepository.drop(action)
    await this.#demandeDeSubventionRepository.drop(demandesDeSubvention.state.uid.value)
    await this.#coFinancementRepository.drop(action.state.uid.value)

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

type DemandeDeSubventionRepository = DropDemandeDeSubventionRepository & GetDemandeDeSubventionRepository

type CoFinancementRepository = DropCoFinancementRepository
