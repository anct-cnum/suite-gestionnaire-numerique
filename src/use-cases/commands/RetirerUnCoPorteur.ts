import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { MembreFailure, MembreUid, Role, Statut } from '@/domain/Membre'
import { MembreCandidat } from '@/domain/MembreCandidat'
import { MembreConfirme } from '@/domain/MembreConfirme'
import { StructureUid } from '@/domain/Structure'
import { GouvernanceRepository } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'
import { MembreRepository } from '@/use-cases/commands/shared/MembreRepository'
import { UtilisateurRepository } from '@/use-cases/commands/shared/UtilisateurRepository'

export class RetirerUnCoPorteur implements CommandHandler<Command> {
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

    if(membre instanceof MembreCandidat){
      return 'MembreDoitEtreConfirmer'
    }

    if(!membre.state.roles.includes('coporteur')) {
      return 'MembreDéjàNonCoPorteur'
    }

    const nouveauxRoles = [...membre.state.roles].filter( role=> role !== 'coporteur')

    const membreConfirmer= new MembreConfirme(
      new MembreUid(membre.state.uid.value),
      membre.state.nom,
      nouveauxRoles.map(role => new Role(role)),
      new GouvernanceUid(membre.state.uidGouvernance.value),
      new Statut(membre.state.statut),
      new StructureUid(membre.state.uidStructure.value)
    )

    await this.membreRepository.update(membreConfirmer)
    return 'OK'
  }
}

type Failure =
  | 'MembreDéjàNonCoPorteur'
  | 'MembreDoitEtreConfirmer'
  | 'UtilisateurNonAutorise'
  | MembreFailure

type Command = Readonly<{
  uidGouvernance: string
  uidMembre: string
  uidUtilisateurConnecte: string
}>

