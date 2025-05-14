/* eslint-disable no-await-in-loop */
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AddActionRepository, GetActionRepository } from './shared/ActionRepository'
import { AddCoFinancementRepository } from './shared/CoFinancementRepository'
import { AddDemandeDeSubventionRepository } from './shared/DemandeDeSubventionRepository'
import {
  GetFeuilleDeRouteRepository,
  UpdateFeuilleDeRouteRepository,
} from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { MembreDepartementRepository } from './shared/MembreDepartementRepository'
import { TransactionRepository } from './shared/TransactionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Action, ActionFailure } from '@/domain/Action'
import { CoFinancement, CoFinancementFailure } from '@/domain/CoFinancement'
import { DemandeDeSubvention, DemandeDeSubventionFailure } from '@/domain/DemandeDeSubvention'
import { FeuilleDeRoute } from '@/domain/FeuilleDeRoute'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { Utilisateur } from '@/domain/Utilisateur'

export class AjouterUneAction implements CommandHandler<Command> {
  readonly #actionRepository: ActionRepository
  readonly #coFinancementRepository: CoFinancementRepository
  readonly #date: Date
  readonly #demandeDeSubventionRepository: DemandeDeSubventionRepository
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #membreRepository: MembreDepartementRepository
  readonly #transactionRepository: TransactionRepository
  readonly #utilisateurRepository: GetUtilisateurRepository

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    utilisateurRepository: GetUtilisateurRepository,
    actionRepository: ActionRepository,
    demandeDeSubventionRepository: DemandeDeSubventionRepository,
    coFinancementRepository: CoFinancementRepository,
    membreRepository: MembreDepartementRepository,
    transactionRepository: TransactionRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#actionRepository = actionRepository
    this.#demandeDeSubventionRepository = demandeDeSubventionRepository
    this.#coFinancementRepository = coFinancementRepository
    this.#membreRepository = membreRepository
    this.#transactionRepository = transactionRepository
    this.#date = date
  }

  private static creationDesCoFinancements(
    coFinancementsCommand: Array<CoFinancementCommand>,
    uidAction: string
  ): Array<CoFinancement>|CoFinancementFailure {
    const coFinancements: Array<CoFinancement> = []
    
    if (coFinancementsCommand.length > 0) {
      for (const financement of coFinancementsCommand) {
        const coFinancement = CoFinancement.create({
          montant: Number(financement.montant),
          uid: {
            value: 'identifiantCoFinancementPourLaCreation',
          },
          uidAction: {
            value: uidAction,
          },
          uidMembre: financement.membreId,
        })

        if (!(coFinancement instanceof CoFinancement)) {
          return coFinancement
        }

        coFinancements.push(coFinancement)
      }
    }
    return coFinancements
  }

  async handle(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const gouvernance = await this.#gouvernanceRepository.get(
      new GouvernanceUid(command.uidGouvernance)
    )
    if (!gouvernance.peutEtreGereePar(editeur)) {
      return 'utilisateurNePeutPasAjouterAction'
    }
    const feuilleDeRoute = await this.#feuilleDeRouteRepository.get(command.uidFeuilleDeRoute)
    
    const action = Action.create({
      besoins: command.besoins,
      budgetGlobal: command.budgetGlobal,
      contexte: command.contexte,
      dateDeCreation: this.#date,
      dateDeDebut: command.dateDeDebut,
      dateDeFin: command.dateDeFin,
      description: command.description,
      destinataires: command.destinataires,
      nom: command.nom,
      uid: {
        value: 'identifiantPourLaCreation',
      },
      uidCreateur: editeur.state.uid.value,
      uidFeuilleDeRoute: feuilleDeRoute.state.uid,
      uidPorteurs: command.uidPorteurs,
    })

    if (!(action instanceof Action)) {
      return action
    }
    let demandeDeSubvention: DemandeDeSubvention | DemandeDeSubventionFailure | null = null
    if (command.demandesDeSubvention && command.demandesDeSubvention.length > 0) {
      demandeDeSubvention = this.creationDesDemandesDeSubvention(
        command.demandesDeSubvention ?? [],
        action.state.destinataires,
        action.state.uid.value,
        editeur.state.uid.value
      )
      if (!(demandeDeSubvention instanceof DemandeDeSubvention)) {
        return demandeDeSubvention
      }
    }

    const coFinancements: Array<CoFinancement> | CoFinancementFailure =
    AjouterUneAction.creationDesCoFinancements(
      command.coFinancements ?? [],
      action.state.uid.value
    )
    
    if (!Array.isArray(coFinancements)) {
      return coFinancements
    }

    return this.persistAction(action, demandeDeSubvention, coFinancements, command, feuilleDeRoute, editeur)
  }
  
  // Pour l'instant : 1 action = 0 ou 1 demande de subvention. On associe les destinataires à cette demande.
  // => La liste est transformé en une unique demande de subvention.
  private creationDesDemandesDeSubvention(
    demandesDeSubventionCommand: Array<DemandeDeSubventionCommand>,
    beneficiaires: Array<string>,
    uidAction: string,
    uidCreateur: string
  ):  DemandeDeSubvention | DemandeDeSubventionFailure {
    const demande = demandesDeSubventionCommand[0]
    const demandeDeSubvention = DemandeDeSubvention.create({
      beneficiaires,
      dateDeCreation: this.#date,
      derniereModification: this.#date,
      statut: demande.statut,
      subventionDemandee: demande.subventionDemandee,
      subventionEtp: demande.subventionEtp ?? null,
      subventionPrestation: demande.subventionPrestation ?? null,
      uid: {
        value: 'identifiantDemandeDeSubventionPourLaCreation',
      },
      uidAction: {
        value: uidAction, 
      },
      uidCreateur,
      uidEnveloppeFinancement: {
        value: demande.enveloppeFinancementId,
      },
    })

    return demandeDeSubvention
  }

  private async persistAction(
    action: Action, demandeDeSubvention: DemandeDeSubvention | null,
    coFinancements: Array<CoFinancement>, 
    command : Command,
    feuilleDeRoute: FeuilleDeRoute, editeur: Utilisateur
  ): Promise<'OK' | Failure> {
    await this.#transactionRepository.transaction(async (tx) => {
      const actionId = await this.#actionRepository.add(action, tx)
      
      if (demandeDeSubvention) {
        const updatedDemandeDeSubvention = demandeDeSubvention.avecNouvelleUidAction(actionId.toString())
        if (!(updatedDemandeDeSubvention instanceof DemandeDeSubvention)) {
          return updatedDemandeDeSubvention
        }
        await this.#demandeDeSubventionRepository.add(updatedDemandeDeSubvention, tx)
      }

      for (const coFinancement of coFinancements) {
        const updatedCoFinancement = coFinancement.avecNouvelleUidAction(actionId.toString())

        if (!(updatedCoFinancement instanceof CoFinancement)) {
          return updatedCoFinancement
        }

        await this.#coFinancementRepository.add(updatedCoFinancement, tx)

        const membreExistant = await this.#membreRepository.get(
          updatedCoFinancement.state.uidMembre,
          command.uidGouvernance,
          tx
        )
        const estDejaFinanceur = membreExistant ? membreExistant.state.roles.includes('Financeur') : false
        if (!estDejaFinanceur) {
          await this.#membreRepository.add(
            updatedCoFinancement.state.uidMembre,
            command.uidGouvernance,
            'Financeur',
            tx
          )
        }
      }

      const feuilleDeRouteAJour = feuilleDeRoute.mettreAjourLaDateDeModificationEtLEditeur(
        this.#date,
        editeur
      )

      if (!(feuilleDeRouteAJour instanceof FeuilleDeRoute)) {
        return feuilleDeRouteAJour
      }

      await this.#feuilleDeRouteRepository.update(feuilleDeRouteAJour, tx)
      return 'OK'
    })
    return 'OK'
  }
}

type Failure =
  | 'erreurInconnue'
  | 'utilisateurNePeutPasAjouterAction'
  | ActionFailure
  | CoFinancementFailure
  | DemandeDeSubventionFailure

type DemandeDeSubventionCommand = Readonly<{
  beneficiaires: Array<string>
  enveloppeFinancementId: string
  statut: string
  subventionDemandee: number
  subventionEtp?: number
  subventionPrestation?: number
}>

type CoFinancementCommand = Readonly<{
  membreId: string
  montant: number
}>

type Command = Readonly<{
  besoins: Array<string>
  budgetGlobal: number
  coFinancements?: Array<CoFinancementCommand>
  contexte: string
  dateDeDebut: string
  dateDeFin: string
  demandesDeSubvention?: Array<DemandeDeSubventionCommand>
  description: string
  destinataires: Array<string>
  nom: string
  uidEditeur: string
  uidFeuilleDeRoute: string
  uidGouvernance: string
  uidPorteurs: Array<string>
}>

type GouvernanceRepository = GetGouvernanceRepository

type FeuilleDeRouteRepository = GetFeuilleDeRouteRepository & UpdateFeuilleDeRouteRepository

type ActionRepository = AddActionRepository & GetActionRepository

type DemandeDeSubventionRepository = AddDemandeDeSubventionRepository

type CoFinancementRepository = AddCoFinancementRepository
