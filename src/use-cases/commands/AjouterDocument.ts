import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { StockageDocumentGateway } from './shared/StockageDocumentGateway'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class AjouterDocument implements CommandHandler<Command> {
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
      return 'editeurNePeutPasAjouterDocument'
    }

    // Les droits sont vérifiés avant le téléversement : un refus ne laisse aucun fichier orphelin dans le bucket.
    await this.#stockageDocumentGateway.televerser(command.chemin, command.contenu)

    // Remplacement : l'ancienne version est close en base (historique) et son fichier S3 est conservé.
    feuilleDeRoute.ajouterDocument({
      chemin: command.chemin,
      nom: command.nom,
    })
    feuilleDeRoute.mettreAjourLaDateDeModificationEtLEditeur(new Date(command.date), editeur)
    await this.#feuilleDeRouteRepository.update(feuilleDeRoute)

    return 'OK'
  }
}

type Failure = 'editeurNePeutPasAjouterDocument'

type Command = Readonly<{
  chemin: string
  contenu: Buffer
  date: string
  nom: string
  uidEditeur: number
  uidFeuilleDeRoute: string
}>

interface FeuilleDeRouteRepository extends GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository {}

type GouvernanceRepository = GetGouvernanceRepository

type UtilisateurRepository = GetUtilisateurRepository
