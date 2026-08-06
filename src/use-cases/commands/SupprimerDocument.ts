import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { StockageDocumentGateway } from './shared/StockageDocumentGateway'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class SupprimerDocument implements CommandHandler<Command> {
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #stockageDocumentGateway: StockageDocumentGateway
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    gouvernanceRepository: GouvernanceRepository,
    stockageDocumentGateway: StockageDocumentGateway,
    utilisateurRepository: UtilisateurRepository
  ) {
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#gouvernanceRepository = gouvernanceRepository
    this.#stockageDocumentGateway = stockageDocumentGateway
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(feuilleDeRoute.state.uidGouvernance))

    if (!feuilleDeRoute.peutEtreGereePar(editeur, gouvernance.state.membresCoporteurs)) {
      return 'editeurNePeutPasSupprimerDocument'
    }

    const cheminDocument = feuilleDeRoute.state.document?.chemin

    feuilleDeRoute.supprimerDocument()
    feuilleDeRoute.mettreAjourLaDateDeModificationEtLEditeur(new Date(command.date), editeur)
    await this.#feuilleDeRouteRepository.update(feuilleDeRoute)

    // La base d'abord : si la suppression S3 échoue, on laisse un orphelin
    // (rattrapé par le ménage de l'étape 4) plutôt qu'un lien mort.
    if (cheminDocument !== undefined) {
      await this.#stockageDocumentGateway.supprimer(cheminDocument)
    }

    return 'OK'
  }
}

type Failure = 'editeurNePeutPasSupprimerDocument'

type Command = Readonly<{
  date: string
  uidEditeur: string
  uidFeuilleDeRoute: string
}>

interface FeuilleDeRouteRepository extends GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository {}

type GouvernanceRepository = GetGouvernanceRepository

type UtilisateurRepository = GetUtilisateurRepository
