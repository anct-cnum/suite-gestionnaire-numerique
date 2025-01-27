import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindComiteRepository, UpdateComiteRepository } from './shared/ComiteRepository'
import { FindGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Comite, ComiteFailure } from '@/domain/Comite'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class ModifierUnComite implements CommandHandler<Command> {
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

    const comite = await this.#comiteRepository.find(command.uid)
    if (!comite) {
      return 'comiteInexistant'
    }

    const dateDeModification = this.#date
    const comiteModifie = Comite.create({
      commentaire: command.commentaire,
      date: command.date === undefined ? undefined : new Date(command.date),
      dateDeCreation: new Date(comite.state.dateDeCreation),
      dateDeModification,
      frequence: command.frequence,
      type: command.type,
      uid: comite.state.uid,
      uidEditeur: editeur.state.uid,
      uidGouvernance: gouvernance.state.uid,
    })
    if (!(comiteModifie instanceof Comite)) {
      return comiteModifie
    }

    if (!gouvernance.peutEtreGerePar(editeur)) {
      return 'editeurNePeutPasModifierComite'
    }

    await this.#comiteRepository.update(comiteModifie)

    return 'OK'
  }
}

type Failure = 'gouvernanceInexistante' | 'editeurInexistant' | 'comiteInexistant' | 'editeurNePeutPasModifierComite' | ComiteFailure

type Command = Readonly<{
  commentaire?: string
  date?: string
  frequence: string
  type: string
  uid: string
  uidEditeur: string
  uidGouvernance: string
}>

type GouvernanceRepository = FindGouvernanceRepository

type UtilisateurRepository = FindUtilisateurRepository

interface ComiteRepository extends UpdateComiteRepository, FindComiteRepository {}
