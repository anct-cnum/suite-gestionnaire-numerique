import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceFailure, GouvernanceUid, NoteDeContexte } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

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
    const gouvernance = await this.#gouvernanceRepository.find(new GouvernanceUid(command.uidGouvernance))
    if (!gouvernance.peutEtreGerePar(editeur)) {
      return 'utilisateurNePeutPasAjouterNoteDeContexte'
    }
    const result = gouvernance.ajouterNoteDeContexte(
      new NoteDeContexte(
        this.#date,
        new UtilisateurUid(editeur.state.uid),
        command.contenu
      )
    )
    if (isOk(result)) {
      await this.#gouvernanceRepository.update(gouvernance)
    }

    return result
  }
}

type Failure = 'utilisateurNePeutPasAjouterNoteDeContexte' | GouvernanceFailure

type Command = Readonly<{
  contenu: string
  uidEditeur: string
  uidGouvernance: string
}>

export interface GouvernanceRepository extends FindGouvernanceRepository, UpdateGouvernanceRepository {}

type UtilisateurRepository = FindUtilisateurRepository
