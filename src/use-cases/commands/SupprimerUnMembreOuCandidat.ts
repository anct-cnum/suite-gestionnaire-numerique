import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { MembreFailure } from '@/domain/Membre'
import { GetGouvernanceRepository } from '@/use-cases/commands/shared/GouvernanceRepository'
import { GetMembreRepository, UpdateMembreRepository } from '@/use-cases/commands/shared/MembreRepository'
import { GetUtilisateurRepository } from '@/use-cases/commands/shared/UtilisateurRepository'

export class SupprimerUnMembreOuCandidat implements CommandHandler<Command> {
  private readonly gouvernanceRepository: GetGouvernanceRepository
  private readonly membreRepository: GetMembreRepository & UpdateMembreRepository
  private readonly utilisateurRepository: GetUtilisateurRepository

  constructor(
    membreRepository: GetMembreRepository & UpdateMembreRepository,
    utilisateurRepository: GetUtilisateurRepository,
    gouvernanceRepository: GetGouvernanceRepository
  ) {
    this.membreRepository = membreRepository
    this.utilisateurRepository = utilisateurRepository
    this.gouvernanceRepository = gouvernanceRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const user = await this.utilisateurRepository.get(command.uidUtilisateurConnecte)
    const gouvernance = await this.gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    if (!gouvernance.peutEtreGereePar(user)) {
      return 'UtilisateurNonAutorise'
    }
    const membre = await this.membreRepository.get(command.uidMembre)
    if (!membre.appartientALaGouvernance(command.uidGouvernance)) {
      return 'MembreNonAssocieALaGouvernance'
    }

    const membreSupprimer = membre.supprimer(command.date)

    await this.membreRepository.update(membreSupprimer)
    return 'OK'
  }
}

type Failure =
  | 'MembreDéjàNonCoPorteur'
  | 'MembreDoitEtreConfirmer'
  | 'MembreNonAssocieALaGouvernance'
  | 'UtilisateurNonAutorise'
  | MembreFailure

type Command = Readonly<{
  date: Date
  uidGouvernance: string
  uidMembre: string
  uidUtilisateurConnecte: number
}>
