import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetActionRepository, UpdateActionRepository } from './shared/ActionRepository'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { TransactionRepository } from './shared/TransactionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Action, ActionFailure } from '@/domain/Action'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class ModifierUneAction implements CommandHandler<Command> {
  readonly #actionRepository: GetActionRepository & UpdateActionRepository
  readonly #date: Date
  readonly #feuilleDeRouteRepository: GetFeuilleDeRouteRepository & UpdateFeuilleDeRouteRepository
  readonly #gouvernanceRepository: GetGouvernanceRepository
  readonly #transactionRepository: TransactionRepository
  readonly #utilisateurRepository: GetUtilisateurRepository

  constructor(
    gouvernanceRepository: GetGouvernanceRepository,
    feuilleDeRouteRepository: GetFeuilleDeRouteRepository & UpdateFeuilleDeRouteRepository,
    utilisateurRepository: GetUtilisateurRepository,
    actionRepository: GetActionRepository & UpdateActionRepository,
    transactionRepository: TransactionRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#actionRepository = actionRepository
    this.#transactionRepository = transactionRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<'OK' | Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)

    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    if (!gouvernance.peutEtreGereePar(editeur)) {
      return 'utilisateurNePeutPasAjouterAction'
    }
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)
    if (!(feuilleDeRoute instanceof FeuilleDeRoute)) {
      return 'modifierActionErreurFeuilleDeRouteInconnue'
    }

    const actionAModifier = await this.#actionRepository.get(command.uid)
    if (!(actionAModifier instanceof Action)) {
      return 'modifierActionErreurActionInconnue'
    }

    console.log('command', command)
    const actionModifiee = Action.create({
      besoins: command.besoins,
      budgetGlobal: command.budgetGlobal,
      contexte: command.contexte,
      dateDeCreation: new Date(actionAModifier.state.dateDeCreation),
      dateDeDebut: command.anneeDeDebut,
      dateDeFin: command.anneeDeFin,
      demandeDeSubventionUid: actionAModifier.state.demandeDeSubventionUid,
      description: command.description,
      destinataires: actionAModifier.state.destinataires,
      nom: command.nom,
      uid: { value: command.uid },
      uidCreateur: actionAModifier.state.uidCreateur,
      uidFeuilleDeRoute: { value: command.uidFeuilleDeRoute },
      uidPorteurs: command.uidPorteurs,
    })

    if (!(actionModifiee instanceof Action)) {
      return actionModifiee
    }

    await this.#transactionRepository.transaction(async (tx) => {
      const actionModifieeResult = await this.#actionRepository.update(actionModifiee, tx)
      if (!actionModifieeResult) {
        return 'modifierActionErreurInconnue'
      }

      const feuilleDeRouteAJour = feuilleDeRoute.mettreAjourLaDateDeModificationEtLEditeur(
        this.#date,
        editeur
      )

      if (!(feuilleDeRouteAJour instanceof FeuilleDeRoute)) {
        return 'modifierActionErreurInconnue'
      }

      await this.#feuilleDeRouteRepository.update(feuilleDeRouteAJour, tx)
      return 'OK'
    })
    return 'OK'
  }
}

type Command = Readonly<{
  anneeDeDebut: string
  anneeDeFin: string
  besoins: Array<string>
  budgetGlobal: number
  coFinancements: Array<{
    membreId: string
    montant: number
  }>
  contexte: string
  description: string
  destinataires: Array<string>
  nom: string
  uid: string
  uidEditeur: string
  uidFeuilleDeRoute: string
  uidGouvernance: string
  uidPorteurs: Array<string>
}>

type Failure = 'modifierActionErreurActionInconnue' | 'modifierActionErreurEditeurInconnue' | 'modifierActionErreurFeuilleDeRouteInconnue' | 'modifierActionErreurGouvernanceInconnue' | 'utilisateurNePeutPasAjouterAction' | ActionFailure