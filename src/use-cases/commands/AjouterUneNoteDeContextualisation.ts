import { CommandHandler } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class AjouterUneNoteDeContextualisation implements CommandHandler<Command> {
  readonly #date: Date
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    gouvernanceRepository: GouvernanceRepository,
    utilisateurRepository: UtilisateurRepository,
    date: Date
  ) {
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#date = date
  }

  async handle(command: Command): Promise<'OK' | Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)
    const gouvernance = await this.#gouvernanceRepository.get(
      new GouvernanceUid(feuilleDeRoute.state.uidGouvernance)
    )
    if (!feuilleDeRoute.peutEtreGereePar(editeur, gouvernance.state.membresCoporteurs)) {
      return 'utilisateurNePeutPasAjouterNoteDeContextualisation'
    }

    const result = feuilleDeRoute.ajouterUneNoteDeContextualisation(
      command.contenu,
      this.#date,
      new UtilisateurUid(editeur.state.uid)
    )
    if (!isOk(result)) {
      return result as Failure
    }
    await this.#feuilleDeRouteRepository.update(feuilleDeRoute)
    return 'OK'
  }
}

type Command = Readonly<{
  contenu: string
  uidEditeur: string
  uidFeuilleDeRoute: string
}>

type Failure = 'noteDeContextualisationDejaExistante' | 'utilisateurNePeutPasAjouterNoteDeContextualisation'
type FeuilleDeRouteRepository = GetFeuilleDeRouteRepository & UpdateFeuilleDeRouteRepository

type GouvernanceRepository = GetGouvernanceRepository

type UtilisateurRepository = GetUtilisateurRepository
