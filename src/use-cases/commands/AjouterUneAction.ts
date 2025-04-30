
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
  readonly #membreRepository: MembreDepartementRepository
  readonly #utilisateurRepository: GetUtilisateurRepository

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    feuilleDeRouteRepository: FeuilleDeRouteRepository,
    utilisateurRepository: GetUtilisateurRepository,
    actionRepository: ActionRepository,
    demandeDeSubventionRepository: DemandeDeSubventionRepository,
    coFinancementRepository: CoFinancementRepository,
    membreRepository: MembreDepartementRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#feuilleDeRouteRepository = feuilleDeRouteRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#actionRepository = actionRepository
    this.#demandeDeSubventionRepository = demandeDeSubventionRepository
    this.#coFinancementRepository = coFinancementRepository
    this.#membreRepository = membreRepository
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
      budgetGlobal: command.budgetGlobal,
      contexte: command.contexte,
      dateDeCreation: this.#date,
      dateDeDebut: new Date(command.dateDeDebut),
      dateDeFin: new Date(command.dateDeFin),
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

    const demandesDeSubvention: Array<DemandeDeSubvention> = []
    if (command.demandesDeSubvention && command.demandesDeSubvention.length > 0) {
      for (const demande of command.demandesDeSubvention) {
        const demandeDeSubvention = DemandeDeSubvention.create({
          beneficiaires: demande.beneficiaires,
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
            value: action.state.uid.value,
          },
          uidCreateur: action.state.uidCreateur,
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

        if (!membreExistant?.state.roles.includes('Financeur')) {
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
