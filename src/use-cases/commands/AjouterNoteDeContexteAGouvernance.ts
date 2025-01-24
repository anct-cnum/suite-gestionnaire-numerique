import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid, NoteDeContexte } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'

export class AjouterNoteDeContexteAGouvernance implements CommandHandler<Command> {
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #date: Date

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    utilisateurRepository: UtilisateurRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
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
    if (!gouvernance.peutEtreGerePar(editeur)) {
      return 'editeurNePeutPasAjouterNoteDeContexte'
    }

    gouvernance.ajouterNoteDeContexte(
      new NoteDeContexte(this.#date, new UtilisateurUid(editeur.state.uid), command.contenu)
    )
    await this.#gouvernanceRepository.update(gouvernance)

    return 'OK'
  }
}

type Failure = 'gouvernanceInexistante' | 'editeurInexistant' | 'editeurNePeutPasAjouterNoteDeContexte'

type Command = Readonly<{
  contenu: string
  uidEditeur: string
  uidGouvernance: string
}>

export interface GouvernanceRepository extends FindGouvernanceRepository, UpdateGouvernanceRepository {}

type UtilisateurRepository = FindUtilisateurRepository
