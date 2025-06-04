import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetActionRepository, UpdateActionRepository } from './shared/ActionRepository'
import {
  AddDemandeDeSubventionRepository,
  GetDemandeDeSubventionRepository,
  SupprimerDemandeDeSubventionRepository,
  UpdateDemandeDeSubventionRepository,
} from './shared/DemandeDeSubventionRepository'
import { GetFeuilleDeRouteRepository, UpdateFeuilleDeRouteRepository } from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { TransactionRepository } from './shared/TransactionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Action, ActionFailure } from '@/domain/Action'
import { DemandeDeSubvention } from '@/domain/DemandeDeSubvention'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class ModifierUneAction implements CommandHandler<Command> {
  readonly #actionRepository: GetActionRepository & UpdateActionRepository
  readonly #date: Date
  readonly #demandeDeSubventionRepository: 
      AddDemandeDeSubventionRepository
      & GetDemandeDeSubventionRepository
      & SupprimerDemandeDeSubventionRepository
      & UpdateDemandeDeSubventionRepository
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
    demandeDeSubventionRepository: 
      AddDemandeDeSubventionRepository
      & GetDemandeDeSubventionRepository
      & SupprimerDemandeDeSubventionRepository
      & UpdateDemandeDeSubventionRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#actionRepository = actionRepository
    this.#transactionRepository = transactionRepository
    this.#demandeDeSubventionRepository = demandeDeSubventionRepository
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

    let demandeDeSubventionUid = actionAModifier.state.demandeDeSubventionUid

    await this.#transactionRepository.transaction(async (tx) => {
      // Gestion de la demande de subvention
      if (command.demandeDeSubvention) {
        if (demandeDeSubventionUid) {
          // Mise à jour de la demande existante
          const demandeExistante = await this.#demandeDeSubventionRepository.get(demandeDeSubventionUid)
          if (demandeExistante instanceof DemandeDeSubvention) {
            const demandeModifiee = DemandeDeSubvention.create({
              beneficiaires: command.demandeDeSubvention.beneficiaires,
              dateDeCreation: new Date(demandeExistante.state.dateDeCreation),
              derniereModification: this.#date,
              statut: demandeExistante.state.statut,
              subventionDemandee: command.demandeDeSubvention.subventionDemandee,
              subventionEtp: command.demandeDeSubvention.subventionEtp,
              subventionPrestation: command.demandeDeSubvention.subventionPrestation,
              uid: { value: demandeDeSubventionUid },
              uidAction: { value: command.uid },
              uidCreateur: demandeExistante.state.uidCreateur,
              uidEnveloppeFinancement: { value: command.demandeDeSubvention.enveloppeFinancementId },
            })
            if (demandeModifiee instanceof DemandeDeSubvention) {
              await this.#demandeDeSubventionRepository.update(demandeModifiee, tx)
            }
          }
        } else {
          // Création d'une nouvelle demande
          const nouvelleDemande = DemandeDeSubvention.create({
            beneficiaires: command.demandeDeSubvention.beneficiaires,
            dateDeCreation: this.#date,
            derniereModification: this.#date,
            statut: 'deposee',
            subventionDemandee: command.demandeDeSubvention.subventionDemandee,
            subventionEtp: command.demandeDeSubvention.subventionEtp,
            subventionPrestation: command.demandeDeSubvention.subventionPrestation,
            uid: { value: '' },
            uidAction: { value: command.uid },
            uidCreateur: command.uidEditeur,
            uidEnveloppeFinancement: { value: command.demandeDeSubvention.enveloppeFinancementId },
          })
          if (nouvelleDemande instanceof DemandeDeSubvention) {
            const demandeCreee = await this.#demandeDeSubventionRepository.add(nouvelleDemande, tx)
            if (demandeCreee) {
              demandeDeSubventionUid = nouvelleDemande.state.uid.value
            }
          }
        }
      } else if (demandeDeSubventionUid) {
        // Suppression de la demande existante
        await this.#demandeDeSubventionRepository.supprimer(demandeDeSubventionUid, tx)
        demandeDeSubventionUid = ''
      }

      const actionModifiee = Action.create({
        besoins: command.besoins,
        budgetGlobal: command.budgetGlobal,
        contexte: command.contexte,
        dateDeCreation: new Date(actionAModifier.state.dateDeCreation),
        dateDeDebut: command.anneeDeDebut,
        dateDeFin: command.anneeDeFin,
        demandeDeSubventionUid,
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
  demandeDeSubvention?: {
    beneficiaires: Array<string>
    enveloppeFinancementId: string
    subventionDemandee: number
    subventionEtp: number
    subventionPrestation: number
  }
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