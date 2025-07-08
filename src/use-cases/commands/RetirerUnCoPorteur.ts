import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { MembreFailure, MembreUid, Role, Statut } from '@/domain/Membre'
import { MembreCandidat } from '@/domain/MembreCandidat'
import { MembreConfirme } from '@/domain/MembreConfirme'
import { MembreRepository } from '@/use-cases/commands/shared/MembreRepository'

export class RetirerUnCoPorteur implements CommandHandler<Command> {
  private readonly membreRepository: MembreRepository

  constructor(membreRepository: MembreRepository) {
    this.membreRepository = membreRepository}

  async handle(command: Command): ResultAsync<Failure> {
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
      new Statut(membre.state.statut)
    )

    await this.membreRepository.update(membreConfirmer)
    return 'OK'
  }
}

type Failure =
  | 'MembreDéjàNonCoPorteur'
  | 'MembreDoitEtreConfirmer'
  | MembreFailure

type Command = Readonly<{
  uidGouvernance: string
  uidMembre: string
}>

