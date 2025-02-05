import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
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

  async handle(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)

    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))

    if (!gouvernance.peutEtreGerePar(editeur)) {
      return 'editeurNePeutPasSupprimerNotePrivee'
    }

    gouvernance.supprimerNotePrivee()

    await this.#gouvernanceRepository.update(gouvernance)

    return 'OK'
  }
}

type Failure = 'editeurNePeutPasSupprimerNotePrivee'

type Command = Readonly<{
  uidEditeur: string
  uidGouvernance: string
}>

interface GouvernanceRepository extends GetGouvernanceRepository, UpdateGouvernanceRepository {}

type UtilisateurRepository = GetUtilisateurRepository
