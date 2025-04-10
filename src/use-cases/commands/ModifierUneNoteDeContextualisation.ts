import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRouteFailure , FeuilleDeRouteUid, NoteDeContextualisation } from '@/domain/FeuilleDeRoute'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class ModifierUneNoteDeContextualisation implements CommandHandler<Command> {
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

  async handle(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(new FeuilleDeRouteUid(command.uidFeuilleDeRoute))
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidFeuilleDeRoute))
    if (!gouvernance.peutEtreGereePar(editeur) || !feuilleDeRoute.peutEtreGereePar(editeur)) {
      return 'utilisateurNePeutPasModifierNoteDeContextualisation'
    }
    const result = feuilleDeRoute.modifierUneNoteDeContextualisation(
      new NoteDeContextualisation(
        this.#date,
        new UtilisateurUid(editeur.state.uid),
        command.contenu
      )
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

type GouvernanceRepository = GetGouvernanceRepository

type UtilisateurRepository = GetUtilisateurRepository

type Failure = 'utilisateurNePeutPasModifierNoteDeContextualisation' | FeuilleDeRouteFailure
