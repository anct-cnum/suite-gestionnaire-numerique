import { CommandHandler } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRouteUid } from '@/domain/FeuilleDeRoute'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class AjouterUneNoteDeContextualisation implements CommandHandler<Command> {
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

  async handle(command: Command): Promise<'OK' | Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(new FeuilleDeRouteUid(command.uidFeuilleDeRoute))
    if (!feuilleDeRoute.peutEtreGereePar(editeur)) {
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

type UtilisateurRepository = GetUtilisateurRepository
