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
      beneficiaires: command.beneficiaires,
      besoins: command.besoins,
      budgetGlobal: command.budgetGlobal,
      contexte: command.contexte,
      dateDeCreation: this.#date,
      dateDeDebut: command.dateDeDebut,
      dateDeFin: command.dateDeFin,
      description: command.description,
      nom: command.nom,
      uid: {
        value: 'identifiantPourLaCreation',
      },
      uidCreateur: editeur.state.uid.value,
      uidFeuilleDeRoute: feuilleDeRoute.state.uid,
      uidPorteur: command.uidPorteur,
    })

    if (!(action instanceof Action)) {
      return action
    }

    const demandesDeSubvention: DemandeDeSubvention | DemandeDeSubventionFailure =
     this.creationDesDemandesDeSubvention(
       command.demandesDeSubvention ?? [],
       action.state.beneficiaires,
       action.state.uid.value,
       editeur.state.uid.value
     )
    if (!(demandesDeSubvention instanceof DemandeDeSubvention)) {
      return demandesDeSubvention
    }

    const coFinancements: Array<CoFinancement> | CoFinancementFailure =
    AjouterUneAction.creationDesCoFinancements(
      command.coFinancements ?? [],
      action.state.uid.value
    )
    
    if (!Array.isArray(coFinancements)) {
      return coFinancements
    }

    return  this.persistAction(action, demandesDeSubvention, coFinancements, command, feuilleDeRoute, editeur)
  }

  // A FAIRE: Vérifier si on peut avoir 0 ou plusieurs demandes de subvention pour une même action
  // Pour l'instant : 1 action = 1 demande de subvention. On associe les bénéfiaires à cette demande.
  // Discussion sens métier :  c'est le récipiendaire qui recoit l'argent. Il y a peut être confusion entre 
  // bénéficiaire et récipiendaire.
  // De plus, les beneficaires sont lies à l'action, pas à la demande de subvention => on ne lit pas les 
  // beneficaires de la  demande de subvention mais on utilise ceux fournis par l'action.
  private creationDesDemandesDeSubvention(
    demandesDeSubventionCommand: Array<DemandeDeSubventionCommand>,
    beneficiaires: Array<string>,
    uidAction: string,
    uidCreateur: string
  ):  DemandeDeSubvention | DemandeDeSubventionFailure {
    if (demandesDeSubventionCommand.length > 0) {
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

      if (!(demandeDeSubvention instanceof DemandeDeSubvention)) {
        return demandeDeSubvention
      }
      return demandeDeSubvention
    }
    return DemandeDeSubvention.create({
      beneficiaires,
      dateDeCreation: this.#date,
      derniereModification: this.#date,
      statut: 'En cours',
      subventionDemandee: 0,
      subventionEtp: null,
      subventionPrestation: null,
      uid: {
        value: 'identifiantDemandeDeSubventionPourLaCreation',
      },
      uidAction: {
        value: uidAction,
      },
      uidCreateur,
      uidEnveloppeFinancement: {
        value: demandesDeSubventionCommand[0].enveloppeFinancementId,
      },
    })
  }

  private async persistAction(
    action: Action, demandesDeSubvention: DemandeDeSubvention,
    coFinancements: Array<CoFinancement>, 
    command : Command,
    feuilleDeRoute: FeuilleDeRoute, editeur: Utilisateur
  ): Promise<'OK' | Failure> {
    await this.#transactionRepository.transaction(async (tx) => {
      const actionId = await this.#actionRepository.add(action, tx)
      
      const updatedDemandeDeSubvention = demandesDeSubvention.avecNouvelleUidAction(actionId.toString())
      if (!(updatedDemandeDeSubvention instanceof DemandeDeSubvention)) {
        return updatedDemandeDeSubvention
      }
      await this.#demandeDeSubventionRepository.add(updatedDemandeDeSubvention, tx)

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
  beneficiaires: Array<string>
  besoins: Array<string>
  budgetGlobal: number
  coFinancements?: Array<CoFinancementCommand>
  contexte: string
  dateDeDebut: string
  dateDeFin: string
  demandesDeSubvention?: Array<DemandeDeSubventionCommand>
  description: string
  nom: string
  uidEditeur: string
  uidFeuilleDeRoute: string
  uidGouvernance: string
  uidPorteur: string
}>

type GouvernanceRepository = GetGouvernanceRepository

type FeuilleDeRouteRepository = GetFeuilleDeRouteRepository & UpdateFeuilleDeRouteRepository

type ActionRepository = AddActionRepository & GetActionRepository

type DemandeDeSubventionRepository = AddDemandeDeSubventionRepository

type CoFinancementRepository = AddCoFinancementRepository
