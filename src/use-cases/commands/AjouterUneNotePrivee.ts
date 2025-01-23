import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid, NotePrivee } from '@/domain/Gouvernance'
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

  async execute(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.find(command.uidUtilisateurCourant)
    if (!utilisateurCourant) {
      return 'utilisateurCourantInexistant'
    }

    const gouvernance = await this.#gouvernanceRepository.find(new GouvernanceUid(command.uidGouvernance))
    if (!gouvernance) {
      return 'gouvernanceInexistante'
    }

    if (!gouvernance.laNotePriveePeutEtreGerePar(utilisateurCourant)) {
      return 'utilisateurNePeutPasAjouterNotePrivee'
    }

    const result = gouvernance.ajouterNotePrivee(
      new NotePrivee(this.#date, new UtilisateurUid(utilisateurCourant.state.uid), command.contenu)
    )
    if (isOk(result)) {
      await this.#gouvernanceRepository.update(gouvernance)
    }

    return result
  }
}

type Failure = 'gouvernanceInexistante' | 'utilisateurCourantInexistant' | 'utilisateurNePeutPasAjouterNotePrivee' | 'notePriveeDejaExistante'

type Command = Readonly<{
  contenu: string
  uidUtilisateurCourant: string
  uidGouvernance: string
}>

interface GouvernanceRepository extends FindGouvernanceRepository, UpdateGouvernanceRepository {}

type UtilisateurRepository = FindUtilisateurRepository
