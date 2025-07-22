import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'

export class AjouterDocument implements CommandHandler<Command> {
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    utilisateurRepository: UtilisateurRepository
  ) {
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)

    if (!feuilleDeRoute.peutEtreGereePar(editeur)) {
      return 'editeurNePeutPasAjouterDocument'
    }

    feuilleDeRoute.ajouterDocument({
      chemin: command.chemin,
      nom: command.nom,
    })
    // eslint-disable-next-line no-restricted-syntax
    feuilleDeRoute.mettreAjourLaDateDeModificationEtLEditeur(new Date(), editeur)
    await this.#feuilleDeRouteRepository.update(feuilleDeRoute)

    return 'OK'
  }
}

type Failure = 'editeurNePeutPasAjouterDocument'

type Command = Readonly<{
  chemin: string
  nom: string
  uidEditeur: string
  uidFeuilleDeRoute: string
}>

interface FeuilleDeRouteRepository extends GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository { }

type UtilisateurRepository = GetUtilisateurRepository
