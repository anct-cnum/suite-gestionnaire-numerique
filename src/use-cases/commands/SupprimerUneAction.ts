import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetActionRepository, SupprimerActionRepository } from './shared/ActionRepository'
import { GetDemandeDeSubventionRepository } from './shared/DemandeDeSubventionRepository'
import { GetFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Action, ActionUid } from '@/domain/Action'
import { DemandeDeSubvention, DemandeDeSubventionUid, StatutSubvention } from '@/domain/DemandeDeSubvention'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class SupprimerUneAction implements CommandHandler<Command> {
  readonly #actionRepository: GetActionRepository & SupprimerActionRepository
  readonly #demandeDeSubventionRepository: GetDemandeDeSubventionRepository
  readonly #feuilleDeRouteRepository: GetFeuilleDeRouteRepository
  readonly #gouvernanceRepository: GetGouvernanceRepository
  readonly #utilisateurRepository: GetUtilisateurRepository

  constructor(
    actionRepository: GetActionRepository & SupprimerActionRepository,
    demandeDeSubventionRepository: GetDemandeDeSubventionRepository,
    feuilleDeRouteRepository: GetFeuilleDeRouteRepository,
    gouvernanceRepository: GetGouvernanceRepository,
    utilisateurRepository: GetUtilisateurRepository
  ) {
    this.#actionRepository = actionRepository
    this.#demandeDeSubventionRepository = demandeDeSubventionRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const actionASupprimer = await this.#actionRepository.get(command.uidActionASupprimer)
    if (!(actionASupprimer instanceof Action)) {
      return 'supprimerActionErreurInconnue'
    }

    // L'habilitation se vérifie sur la gouvernance à laquelle l'action est réellement rattachée
    // (action → feuille de route → gouvernance), jamais sur un identifiant fourni par le client.
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(actionASupprimer.state.uidFeuilleDeRoute)
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(feuilleDeRoute.state.uidGouvernance))
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    if (!gouvernance.peutEtreGereePar(editeur)) {
      return 'suppressionActionNonAutorisee'
    }

    if (actionASupprimer.state.demandeDeSubventionUid) {
      const demandeDeSubventionResult = await this.#demandeDeSubventionRepository.get(
        actionASupprimer.state.demandeDeSubventionUid
      )

      if (!(demandeDeSubventionResult instanceof DemandeDeSubvention)) {
        return 'supprimerActionErreurInconnue'
      }
      if (demandeDeSubventionResult.state.statut !== StatutSubvention.DEPOSEE) {
        return 'existeSubventionNonSupprimable'
      }
    }

    const result = await this.#actionRepository.supprimer(
      new ActionUid(command.uidActionASupprimer),
      new DemandeDeSubventionUid(actionASupprimer.state.demandeDeSubventionUid)
    )
    if (result) {
      return 'OK'
    }

    return 'supprimerActionErreurInconnue'
  }
}

type Failure = 'existeSubventionNonSupprimable' | 'suppressionActionNonAutorisee' | 'supprimerActionErreurInconnue'

type Command = Readonly<{
  uidActionASupprimer: string
  uidEditeur: number
}>
