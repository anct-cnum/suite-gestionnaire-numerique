import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GouvernanceRepository } from './AjouterNoteDeContexteAGouvernance'
import { FeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute, FeuilleDeRouteFailure, PerimetreGeographiqueTypes } from '@/domain/FeuilleDeRoute'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class AjouterUneFeuilleDeRoute implements CommandHandler<Command> {
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

    const feuilleDeRoute = FeuilleDeRoute.create({
      dateDeCreation: this.#date,
      dateDeModification: this.#date,
      nom :command.nom,
      perimetreGeographique:command.perimetreGeographique,
      uid: {
        value: 'identifiantPourLaCreation',
      },
      uidEditeur: editeur.state.uid,
      uidGouvernance: gouvernance.state.uid,
      uidPorteur: command.uidPorteur,
    })

    if (!(feuilleDeRoute instanceof FeuilleDeRoute)) {
      return feuilleDeRoute
    }
    await this.#feuilleDeRouteRepository.add(feuilleDeRoute)

    return 'OK'
  }
}

type Failure = 'utilisateurNePeutPasAjouterFeuilleDeRoute' | FeuilleDeRouteFailure

type Command = Readonly<{
  nom: string
  perimetreGeographique: PerimetreGeographiqueTypes
  uidEditeur: string
  uidGouvernance: string
  uidPorteur: string
}>
