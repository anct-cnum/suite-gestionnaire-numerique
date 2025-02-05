import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceFailure, GouvernanceUid, NotePrivee } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class AjouterUneNotePrivee implements CommandHandler<Command> {
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

  async handle(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    if (!gouvernance.laNotePriveePeutEtreGerePar(editeur)) {
      return 'utilisateurNePeutPasAjouterNotePrivee'
    }

    const result = gouvernance.ajouterNotePrivee(
      new NotePrivee(this.#date, new UtilisateurUid(editeur.state.uid), command.contenu)
    )
    if (isOk(result)) {
      await this.#gouvernanceRepository.update(gouvernance)
    }

    return result
  }
}

type Failure = 'utilisateurNePeutPasAjouterNotePrivee' | GouvernanceFailure

type Command = Readonly<{
  contenu: string
  uidEditeur: string
  uidGouvernance: string
}>

interface GouvernanceRepository extends GetGouvernanceRepository, UpdateGouvernanceRepository {}

type UtilisateurRepository = GetUtilisateurRepository
