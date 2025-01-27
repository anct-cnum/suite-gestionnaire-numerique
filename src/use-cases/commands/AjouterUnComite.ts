import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AddComiteRepository } from './shared/ComiteRepository'
import { FindGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Comite, ComiteFailure } from '@/domain/Comite'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class AjouterUnComite implements CommandHandler<Command> {
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #comiteRepository: ComiteRepository
  readonly #date: Date

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    utilisateurRepository: UtilisateurRepository,
    comiteRepository: ComiteRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#comiteRepository = comiteRepository
    this.#date = date
  }

  async execute(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.find(command.uidEditeur)
    if (!editeur) {
      return 'editeurInexistant'
    }

    const gouvernance = await this.#gouvernanceRepository.find(new GouvernanceUid(command.uidGouvernance))
    if (!gouvernance) {
      return 'gouvernanceInexistante'
    }

    const dateDeCreation = this.#date
    const comite = Comite.create({
      commentaire: command.commentaire,
      date: command.date === undefined ? undefined : new Date(command.date),
      dateDeCreation,
      dateDeModification: dateDeCreation,
      frequence: command.frequence,
      type: command.type,
      uid: {
        value: 'identifiantPourLaCreation',
      },
      uidEditeur: editeur.state.uid,
      uidGouvernance: gouvernance.state.uid,
    })
    if (!(comite instanceof Comite)) {
      return comite
    }

    if (!gouvernance.peutEtreGerePar(editeur)) {
      return 'editeurNePeutPasAjouterComite'
    }

    await this.#comiteRepository.add(comite)

    return 'OK'
  }
}

type Failure = 'gouvernanceInexistante' | 'editeurInexistant' | 'editeurNePeutPasAjouterComite' | ComiteFailure

type Command = Readonly<{
  commentaire?: string
  date?: string
  frequence: string
  type: string
  uidEditeur: string
  uidGouvernance: string
}>

type GouvernanceRepository = FindGouvernanceRepository

type UtilisateurRepository = FindUtilisateurRepository

type ComiteRepository = AddComiteRepository
