import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute, FeuilleDeRouteFailure, PerimetreGeographiqueTypes } from '@/domain/FeuilleDeRoute'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class ModifierUneFeuilleDeRoute implements CommandHandler<Command> {
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
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    if (!gouvernance.peutEtreGereePar(editeur)) {
      return 'editeurNePeutPasModifierFeuilleDeRoute'
    }
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)

    const feuilleDeRouteModifiee = FeuilleDeRoute.create({
      dateDeCreation: new Date(feuilleDeRoute.state.dateDeCreation),
      dateDeModification: this.#date,
      nom: command.nom,
      perimetreGeographique: command.perimetreGeographique,
      uid: feuilleDeRoute.state.uid,
      uidEditeur: editeur.state.uid,
      uidGouvernance: gouvernance.state.uid,
      uidPorteur: command.uidPorteur,
    })

    if (!(feuilleDeRouteModifiee instanceof FeuilleDeRoute)) {
      return feuilleDeRouteModifiee
    }
    await this.#feuilleDeRouteRepository.update(feuilleDeRouteModifiee)

    return 'OK'
  }
}

type Failure = 'editeurNePeutPasModifierFeuilleDeRoute' | FeuilleDeRouteFailure

type Command = Readonly<{
  nom: string
  perimetreGeographique: PerimetreGeographiqueTypes
  uidEditeur: string
  uidFeuilleDeRoute: string
  uidGouvernance: string
  uidPorteur: string
}>

type GouvernanceRepository = GetGouvernanceRepository

type UtilisateurRepository = GetUtilisateurRepository

interface FeuilleDeRouteRepository extends GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository {}
