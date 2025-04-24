import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AddActionRepository } from './shared/ActionRepository'
import { GetFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Action, ActionFailure } from '@/domain/Action'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class AjouterUneAction implements CommandHandler<Command> {
  readonly #actionRepository: ActionRepository
  readonly #date: Date
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: GetUtilisateurRepository

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    utilisateurRepository: GetUtilisateurRepository,
    actionRepository: ActionRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#actionRepository = actionRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    if (!gouvernance.peutEtreGereePar(editeur)) {
      return 'utilisateurNePeutPasAjouterAction'
    }
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)

    const action = Action.create({
      besoins: command.besoins,
      budgetGlobal: command.budgetGlobal,
      contexte: command.contexte,
      dateDeCreation: this.#date,
      dateDeDebut: new Date(command.dateDeDebut),
      dateDeFin: new Date(command.dateDeFin),
      dateDeModification: this.#date,
      description: command.description,
      nom: command.nom,
      uid: {
        value: 'identifiantPourLaCreation',
      },
      uidEditeur: editeur.state.uid,
      uidFeuilleDeRoute: feuilleDeRoute.state.uid,
      uidPorteur: command.uidPorteur,
    })

    if (!(action instanceof Action)) {
      return action
    }
    await this.#actionRepository.add(action)

    return 'OK'
  }
}

type Failure = 'utilisateurNePeutPasAjouterAction' | ActionFailure

type Command = Readonly<{
  besoins: Array<string>
  budgetGlobal: string
  contexte: string
  dateDeDebut: string
  dateDeFin: string
  description: string
  nom: string
  uidEditeur: string
  uidFeuilleDeRoute: string
  uidGouvernance: string
  uidPorteur: string
}>

type GouvernanceRepository = GetGouvernanceRepository

type FeuilleDeRouteRepository = GetFeuilleDeRouteRepository

type ActionRepository = AddActionRepository
