import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GouvernanceRepository } from './AjouterNoteDeContexteAGouvernance'
import { FeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { FeuilleDeRoute, FeuilleDeRouteFailure, PerimetreGeographiqueTypes } from '@/domain/FeuilleDeRoute'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class ModifierUneFeuilleDeRoute implements CommandHandler<Command> {
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
