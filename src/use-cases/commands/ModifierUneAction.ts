/* eslint-disable no-await-in-loop */
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetActionRepository, UpdateActionRepository } from './shared/ActionRepository'
import { creationDesCoFinancements } from './shared/ActionUtils'
import { 
  AddCoFinancementRepository,
  GetCoFinancementRepository,
  SupprimerCoFinancementRepository,
  UpdateCoFinancementRepository, 
} from './shared/CoFinancementRepository'
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
import { DemandeDeSubvention , DemandeDeSubventionFailure, StatutSubvention } from '@/domain/DemandeDeSubvention'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class ModifierUneAction implements CommandHandler<Command> {
  readonly #actionRepository: GetActionRepository & UpdateActionRepository
  readonly #coFinancementRepository: 
      AddCoFinancementRepository
      & GetCoFinancementRepository
      & SupprimerCoFinancementRepository
      & UpdateCoFinancementRepository
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
    coFinancementRepository:
      AddCoFinancementRepository
      & GetCoFinancementRepository
      & SupprimerCoFinancementRepository
      & UpdateCoFinancementRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#actionRepository = actionRepository
    this.#transactionRepository = transactionRepository
    this.#demandeDeSubventionRepository = demandeDeSubventionRepository
    this.#coFinancementRepository = coFinancementRepository
    this.#date = date
  }

  async handle(command: Command):ResultAsync<Failure> {
    console.log('command',command)
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    console.log('editeur',editeur)
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    console.log('gouvernance',gouvernance)
    if (!gouvernance.peutEtreGereePar(editeur)) {
      return 'utilisateurNePeutPasAjouterAction'
    }
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)
    console.log('feuilleDeRoute',feuilleDeRoute)
    if (!(feuilleDeRoute instanceof FeuilleDeRoute)) {
      return 'modifierActionErreurFeuilleDeRouteInconnue'
    }

    const actionAModifier = await this.#actionRepository.get(command.uid)
    console.log('actionAModifier',actionAModifier)
    if (!(actionAModifier instanceof Action)) {
      return 'modifierActionErreurActionInconnue'
    }
    console.log('actionAModifier',actionAModifier)
    const result = await this.#transactionRepository.transaction(async (tx) => {
      let demandeDeSubventionUid = actionAModifier.state.demandeDeSubventionUid
      let demandeDeSubventionExistante: DemandeDeSubvention | DemandeDeSubventionFailure | undefined
      console.log('demandeDeSubventionUid',demandeDeSubventionUid)
      if (demandeDeSubventionUid) {
        demandeDeSubventionExistante = await this.#demandeDeSubventionRepository.get(demandeDeSubventionUid)
        
        if (!(demandeDeSubventionExistante instanceof DemandeDeSubvention)) {
          return 'modifierActionErreurDemandeDeSubventionInconnue'
        }
        console.log('demandeDeSubventionExistante',demandeDeSubventionExistante.state)
        if (demandeDeSubventionExistante.state.statut !== StatutSubvention.DEPOSEE) {
          console.log('demandeDeSubventionExistanteBBMABMA')
          return 'modifierActionErreurDemandeDeSubventionStatutInvalide'
        }
      }
      if (command.demandeDeSubvention) {
        if (demandeDeSubventionExistante instanceof DemandeDeSubvention) {
          // Mise à jour de la demande existante so elle est dans un état qui permet de la modifier
          const demandeModifiee = DemandeDeSubvention.create({
            beneficiaires: command.destinataires,
            dateDeCreation: new Date(demandeDeSubventionExistante.state.dateDeCreation),
            derniereModification: this.#date,
            statut: demandeDeSubventionExistante.state.statut,
            subventionDemandee: command.demandeDeSubvention.subventionDemandee,
            subventionEtp: command.demandeDeSubvention.subventionEtp,
            subventionPrestation: command.demandeDeSubvention.subventionPrestation,
            uid: { value: demandeDeSubventionUid },
            uidAction: { value: command.uid },
            uidCreateur: demandeDeSubventionExistante.state.uidCreateur,
            uidEnveloppeFinancement: { value: command.demandeDeSubvention.enveloppeFinancementId },
          })
          if (demandeModifiee instanceof DemandeDeSubvention) {
            await this.#demandeDeSubventionRepository.update(demandeModifiee, tx)
          }
        } else {
          // Création d'une nouvelle demande
          const nouvelleDemande = DemandeDeSubvention.create({
            beneficiaires: command.destinataires,
            dateDeCreation: this.#date,
            derniereModification: this.#date,
            statut: StatutSubvention.DEPOSEE,
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
        // Suppression de la demande existante si elle est dans un état qui permet de la supprimer

        await this.#demandeDeSubventionRepository.supprimer(demandeDeSubventionUid, tx)
        demandeDeSubventionUid = ''
      }

      // Gestion des cofinancements
      if (command.coFinancements.length > 0) {
        // Suppression des cofinancements existants
        await this.#coFinancementRepository.supprimer(actionAModifier.state.uid.value, tx)
        
        // Création des nouveaux cofinancements
        const coFinancements = creationDesCoFinancements(command.coFinancements, actionAModifier.state.uid.value)
        if (Array.isArray(coFinancements)) {
          for (const coFinancement of coFinancements) {
            await this.#coFinancementRepository.add(coFinancement, tx)
          }
        } else {
          return coFinancements
        }
      } else {
        // Si aucun cofinancement n'est fourni, on supprime tous les cofinancements existants
        await this.#coFinancementRepository.supprimer(actionAModifier.state.uid.value, tx)
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
    return result
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

type Failure = 'modifierActionErreurDemandeDeSubventionInconnue' 
| 'modifierActionErreurDemandeDeSubventionStatutInvalide'
| 'modifierActionErreurEditeurInconnue' 
| 'modifierActionErreurFeuilleDeRouteInconnue'
| 'modifierActionErreurGouvernanceInconnue'
| 'modifierActionErreurInconnue'
| 'montantInvalide'
| 'utilisateurNePeutPasAjouterAction'
| ActionFailure
| DemandeDeSubventionFailure
