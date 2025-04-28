
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AddActionRepository, GetActionRepository } from './shared/ActionRepository'
import { AddCoFinancementRepository } from './shared/CoFinancementRepository'
import { AddDemandeDeSubventionRepository } from './shared/DemandeDeSubventionRepository'
import {
  GetFeuilleDeRouteRepository,
  UpdateFeuilleDeRouteRepository,
} from './shared/FeuilleDeRouteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import prisma from '../../../prisma/prismaClient'
import { Action, ActionFailure } from '@/domain/Action'
import { CoFinancement, CoFinancementFailure } from '@/domain/CoFinancement'
import { DemandeDeSubvention, DemandeDeSubventionFailure } from '@/domain/DemandeDeSubvention'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { isOk } from '@/shared/lang'

export class AjouterUneAction implements CommandHandler<Command> {
  readonly #actionRepository: ActionRepository
  readonly #coFinancementRepository: CoFinancementRepository
  readonly #date: Date
  readonly #demandeDeSubventionRepository: DemandeDeSubventionRepository
  readonly #feuilleDeRouteRepository: FeuilleDeRouteRepository
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: GetUtilisateurRepository

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    utilisateurRepository: GetUtilisateurRepository,
    actionRepository: ActionRepository,
    demandeDeSubventionRepository: DemandeDeSubventionRepository,
    coFinancementRepository: CoFinancementRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#actionRepository = actionRepository
    this.#demandeDeSubventionRepository = demandeDeSubventionRepository
    this.#coFinancementRepository = coFinancementRepository
    this.#date = date
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
      budgetGlobal: Number(command.budgetGlobal),
      contexte: command.contexte,
      dateDeCreation: this.#date,
      dateDeDebut: new Date(command.dateDeDebut),
      dateDeFin: new Date(command.dateDeFin),
      description: command.description,
      nom: command.nom,
      uid: {
        value: 'identifiantPourLaCreation',
      },
      uidFeuilleDeRoute: feuilleDeRoute.state.uid,
      uidPorteur: command.uidPorteur,
    })

    if (!(action instanceof Action)) {
      return action
    }

    const demandesDeSubvention: Array<DemandeDeSubvention> = []
    if (command.demandesDeSubvention && command.demandesDeSubvention.length > 0) {
      for (const demande of command.demandesDeSubvention) {
        const demandeDeSubvention = DemandeDeSubvention.create({
          beneficiaires: demande.beneficiaires,
          dateDeCreation: this.#date,
          derniereModification: this.#date,
          statut: demande.statut,
          subventionDemandee: Number(demande.subventionDemandee),
          subventionEtp: demande.subventionEtp ? Number(demande.subventionEtp) : null,
          subventionPrestation: demande.subventionPrestation
            ? Number(demande.subventionPrestation)
            : null,
          uid: {
            value: 'identifiantDemandeDeSubventionPourLaCreation',
          },
          uidAction: {
            value: action.state.uid.value,
          },
          uidEnveloppeFinancement: {
            value: demande.enveloppeFinancementId,
          },
        })

        if (!(demandeDeSubvention instanceof DemandeDeSubvention)) {
          return demandeDeSubvention
        }

        demandesDeSubvention.push(demandeDeSubvention)
      }
    }

    const coFinancements: Array<CoFinancement> = []
    if (command.coFinancements && command.coFinancements.length > 0) {
      for (const financement of command.coFinancements) {
        const coFinancement = CoFinancement.create({
          montant: Number(financement.montant),
          uid: {
            value: 'identifiantCoFinancementPourLaCreation',
          },
          uidAction: {
            value: action.state.uid.value,
          },
          uidMembre: financement.membreId,
        })

        if (!(coFinancement instanceof CoFinancement)) {
          return coFinancement
        }

        coFinancements.push(coFinancement)
      }
    }

    await prisma.$transaction(async (tx) => {
      await this.#actionRepository.add(action, tx)

      const actionCree = await this.#actionRepository.get(action.state.uid.value)

      const actionId = actionCree.state.uid.value

      for (const demandeDeSubvention of demandesDeSubvention) {
        // Update uidAction with real action ID
        const updatedDemandeDeSubvention = demandeDeSubvention.avecNouvelleUidAction(actionId.toString())

        if (!(updatedDemandeDeSubvention instanceof DemandeDeSubvention)) {
          throw new Error('Erreur lors de la mise à jour de l\'identifiant de l\'action pour la demande de subvention')
        }

        await this.#demandeDeSubventionRepository.add(updatedDemandeDeSubvention, tx)
      }
      for (const coFinancement of coFinancements) {
        const updatedCoFinancement = coFinancement.avecNouvelleUidAction(actionId.toString())

        if (!(updatedCoFinancement instanceof CoFinancement)) {
          throw new Error('Erreur lors de la mise à jour de l\'identifiant de l\'action pour le co-financement')
        }

        await this.#coFinancementRepository.add(updatedCoFinancement, tx)
      }

      const feuilleDeRouteAJour = feuilleDeRoute.mettreAjourLaDateDeModificationEtLEditeur(
        this.#date,
        editeur
      )

      if (!isOk(feuilleDeRouteAJour)) {
        return feuilleDeRouteAJour
      }

      await this.#feuilleDeRouteRepository.update(feuilleDeRouteAJour, tx)
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
  subventionDemandee: string
  subventionEtp?: string
  subventionPrestation?: string
}>

type CoFinancementCommand = Readonly<{
  membreId: string
  montant: string
}>

type Command = Readonly<{
  beneficiaires: Array<string>
  besoins: Array<string>
  budgetGlobal: string
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
