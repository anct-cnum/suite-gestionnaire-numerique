import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetMembreRepository, UpdateMembreRepository } from './shared/MembreRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { Membre, MembreFailure } from '@/domain/Membre'

export class AccepterUnMembre implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #membreRepository: MembreRepository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    gouvernanceRepository: GouvernanceRepository,
    membreRepository: MembreRepository
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#gouvernanceRepository = gouvernanceRepository
    this.#membreRepository = membreRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const gestionnaire = await this.#utilisateurRepository.get(command.uidGestionnaire)

    const membreInvalide = await this.#membreRepository.get(command.uidMembreInvalide)

    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))

    if (!membreInvalide.appartientALaGouvernance(command.uidGouvernance)) {
      return 'membreInvalideNonAssocieALaGouvernance'
    }

    if (!gouvernance.peutEtreGerePar(gestionnaire)) {
      return 'gestionnaireNePeutPasAccepterLeMembreInvalide'
    }

    const membreValide = membreInvalide.valider()
    if (!(membreValide instanceof Membre)) {
      return membreValide
    }

    await this.#membreRepository.update(membreValide)

    return 'OK'
  }
}

type Failure =
  | 'membreInvalideNonAssocieALaGouvernance'
  | 'gestionnaireNePeutPasAccepterLeMembreInvalide'
  | MembreFailure

type Command = Readonly<{
  uidMembreInvalide: string
  uidGestionnaire: string
  uidGouvernance: string
}>

type UtilisateurRepository = GetUtilisateurRepository

type GouvernanceRepository = GetGouvernanceRepository

type MembreRepository = GetMembreRepository & UpdateMembreRepository
