import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { MembreFailure } from '@/domain/Membre'
import { GouvernanceRepository } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'
import { MembreRepository } from '@/use-cases/commands/shared/MembreRepository'
import { UtilisateurRepository } from '@/use-cases/commands/shared/UtilisateurRepository'

export class SupprimerUnMembreOuCandidat implements CommandHandler<Command> {
  private readonly gouvernanceRepository: GouvernanceRepository
  private readonly membreRepository: MembreRepository
  private readonly utilisateurRepository: UtilisateurRepository

  constructor(membreRepository: MembreRepository,
    utilisateurRepository: UtilisateurRepository,
    gouvernanceRepository: GouvernanceRepository) {
    this.membreRepository = membreRepository
    this.utilisateurRepository = utilisateurRepository
    this.gouvernanceRepository = gouvernanceRepository}

  async handle(command: Command): ResultAsync<Failure> {
    const user = await this.utilisateurRepository.get(command.uidUtilisateurConnecte)
    const gouvernance = await this.gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    if(!gouvernance.peutEtreGereePar(user)){
      return 'UtilisateurNonAutorise'
    }
    const membre = await this.membreRepository.get(command.uidMembre)

    const membreSupprimer = membre.supprimer(command.date)

    await this.membreRepository.update(membreSupprimer)
    return 'OK'
  }
}

type Failure =
  | 'MembreDéjàNonCoPorteur'
  | 'MembreDoitEtreConfirmer'
  | 'UtilisateurNonAutorise'
  | MembreFailure

type Command = Readonly<{
  date: Date
  uidGouvernance: string
  uidMembre: string
  uidUtilisateurConnecte: string
}>

