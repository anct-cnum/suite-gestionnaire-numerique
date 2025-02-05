import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropComiteRepository, GetComiteRepository } from './shared/ComiteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class SupprimerUnComite implements CommandHandler<Command> {
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #comiteRepository: ComiteRepository

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    utilisateurRepository: UtilisateurRepository,
    comiteRepository: ComiteRepository
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#comiteRepository = comiteRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))

    const comite = await this.#comiteRepository.get(command.uid)

    if (!gouvernance.peutEtreGerePar(editeur)) {
      return 'editeurNePeutPasSupprimerComite'
    }

    await this.#comiteRepository.drop(comite)

    return 'OK'
  }
}

type Failure = 'editeurNePeutPasSupprimerComite'

type Command = Readonly<{
  uid: string
  uidEditeur: string
  uidGouvernance: string
}>

type GouvernanceRepository = GetGouvernanceRepository

type UtilisateurRepository = GetUtilisateurRepository

interface ComiteRepository extends DropComiteRepository, GetComiteRepository {}
