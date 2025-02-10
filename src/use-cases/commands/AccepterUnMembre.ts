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

    const membrePotentiel = await this.#membreRepository.get(command.uidMembrePotentiel)

    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))

    if (!membrePotentiel.appartientALaGouvernance(command.uidGouvernance)) {
      return 'membrePotentielNonAssocieALaGouvernance'
    }

    if (!gouvernance.peutEtreGereePar(gestionnaire)) {
      return 'gestionnaireNePeutPasAccepterLeMembrePotentiel'
    }

    const membreConfirme = membrePotentiel.confirmer()
    if (!(membreConfirme instanceof Membre)) {
      return membreConfirme
    }

    await this.#membreRepository.update(membreConfirme)

    return 'OK'
  }
}

type Failure =
  | 'membrePotentielNonAssocieALaGouvernance'
  | 'gestionnaireNePeutPasAccepterLeMembrePotentiel'
  | MembreFailure

type Command = Readonly<{
  uidGestionnaire: string
  uidGouvernance: string
  uidMembrePotentiel: string
}>

type UtilisateurRepository = GetUtilisateurRepository

type GouvernanceRepository = GetGouvernanceRepository

type MembreRepository = GetMembreRepository & UpdateMembreRepository
