import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class SupprimerUneNotePrivee implements CommandHandler<Command> {
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    utilisateurRepository: UtilisateurRepository
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
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
      return 'editeurNePeutPasSupprimerNotePrivee'
    }

    gouvernance.supprimerNotePrivee()

    await this.#gouvernanceRepository.update(gouvernance)

    return 'OK'
  }
}

type Failure = 'gouvernanceInexistante' | 'editeurInexistant' | 'editeurNePeutPasSupprimerNotePrivee'

type Command = Readonly<{
  uidEditeur: string
  uidGouvernance: string
}>

interface GouvernanceRepository extends FindGouvernanceRepository, UpdateGouvernanceRepository {}

type UtilisateurRepository = FindUtilisateurRepository
