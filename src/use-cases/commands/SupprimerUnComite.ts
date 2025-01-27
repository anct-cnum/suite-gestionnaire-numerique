import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropComiteRepository, FindComiteRepository } from './shared/ComiteRepository'
import { FindGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
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

    if (!gouvernance.peutEtreGerePar(editeur)) {
      return 'editeurNePeutPasSupprimerComite'
    }

    await this.#comiteRepository.drop(comite)

    return 'OK'
  }
}

type Failure = 'gouvernanceInexistante' | 'editeurInexistant' | 'comiteInexistant' | 'editeurNePeutPasSupprimerComite'

type Command = Readonly<{
  uid: string
  uidEditeur: string
  uidGouvernance: string
}>

type GouvernanceRepository = FindGouvernanceRepository

type UtilisateurRepository = FindUtilisateurRepository

interface ComiteRepository extends DropComiteRepository, FindComiteRepository {}
