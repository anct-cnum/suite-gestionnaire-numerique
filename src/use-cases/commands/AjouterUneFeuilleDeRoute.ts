import { ResultAsync } from '../CommandHandler'
import { GouvernanceRepository } from './AjouterNoteDeContexteAGouvernance'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { GouvernanceFailure, GouvernanceUid } from '@/domain/Gouvernance'

export class AjouterUneFeuilleDeRoute {
  readonly #date: Date
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: GetUtilisateurRepository

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    utilisateurRepository: GetUtilisateurRepository,
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    if (!gouvernance.peutEtreGereePar(editeur)) {
      return 'utilisateurNePeutPasAjouterFeuilleDeRoute'
    }

    const feuilleDeRoute = FeuilleDeRoute.create(
      command.nom,
      command.perimetreGeographique,
      command.porteur,
      editeur.state.uid.value,
      gouvernance.state.uid.value,
      this.#date
    )
    if (!(feuilleDeRoute instanceof FeuilleDeRoute)) {
      return feuilleDeRoute
    }
    await this.#feuilleDeRouteRepository.add(feuilleDeRoute)
    return 'OK'
  }
}

export interface FeuilleDeRouteRepository {
  add(feuilleDeRoute: FeuilleDeRoute): Promise<void>
}

type Failure = 'utilisateurNePeutPasAjouterFeuilleDeRoute' | GouvernanceFailure

type Command = Readonly<{
  nom: string
  perimetreGeographique: string
  porteur: string
  uidEditeur: string
  uidGouvernance: string
}>
