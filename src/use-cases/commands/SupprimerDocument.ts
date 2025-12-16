import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class SupprimerDocument implements CommandHandler<Command> {
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    gouvernanceRepository: GouvernanceRepository,
    utilisateurRepository: UtilisateurRepository
  ) {
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const gouvernance = await this.#gouvernanceRepository.get(
      new GouvernanceUid(feuilleDeRoute.state.uidGouvernance)
    )

    if (!feuilleDeRoute.peutEtreGereePar(editeur, gouvernance.state.membresCoporteurs)) {
      return 'editeurNePeutPasSupprimerDocument'
    }

    feuilleDeRoute.supprimerDocument()
    feuilleDeRoute.mettreAjourLaDateDeModificationEtLEditeur(new Date(command.date), editeur)
    await this.#feuilleDeRouteRepository.update(feuilleDeRoute)

    return 'OK'
  }
}

type Failure = 'editeurNePeutPasSupprimerDocument'

type Command = Readonly<{
  date: string
  uidEditeur: string
  uidFeuilleDeRoute: string
}>

interface FeuilleDeRouteRepository extends GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository { }

type GouvernanceRepository = GetGouvernanceRepository

type UtilisateurRepository = GetUtilisateurRepository
