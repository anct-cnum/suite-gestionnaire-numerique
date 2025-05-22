import { CommandHandler, ResultAsync } from '../CommandHandler'
import { StatutSubvention } from '../queries/shared/ActionReadModel'
import { Action, ActionUid } from '@/domain/Action'
import { DemandeDeSubvention, DemandeDeSubventionUid } from '@/domain/DemandeDeSubvention'
import { PrismaActionRepository } from '@/gateways/PrismaActionRepository'
import { PrismaDemandeDeSubventionRepository } from '@/gateways/PrismaDemandeDeSubventionRepository'

export class SupprimerUneAction implements CommandHandler<Command> {
  private readonly prismaActionRepository: PrismaActionRepository
  private readonly prismaDemandeDeSubventionRepository: PrismaDemandeDeSubventionRepository

  constructor(prismaActionRepository: PrismaActionRepository, 
    prismaDemandeDeSubventionRepository: PrismaDemandeDeSubventionRepository) {
    this.prismaActionRepository = prismaActionRepository
    this.prismaDemandeDeSubventionRepository = prismaDemandeDeSubventionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const actionASupprimer = await this.prismaActionRepository.get(command.uidActionASupprimer)
    if (!(actionASupprimer instanceof Action)) {
      return 'supprimerActionErreurInconnue'
    }
    
    if (actionASupprimer.state.demandeDeSubventionUid)
    {
      console.log('actionASupprimer.state.demandeDeSubventionUid', actionASupprimer.state.demandeDeSubventionUid)
      console.log('BLAAAAZZZ actionASupprimer', command.uidActionASupprimer)
      const demandeDeSubventionResult = await this.prismaDemandeDeSubventionRepository
        .get(actionASupprimer.state.demandeDeSubventionUid)
        
      if (!(demandeDeSubventionResult instanceof DemandeDeSubvention)) {
        return 'supprimerActionErreurInconnue'
      }
      const demandeDeSubvention = demandeDeSubventionResult
      const estSupprimable = demandeDeSubvention.state.statut === StatutSubvention.DEPOSEE
        
      if (!estSupprimable)
      {return 'existeSubventionNonSupprimable'}
    }

    const result  = await this.prismaActionRepository.supprimer(new ActionUid(command.uidActionASupprimer), 
      new DemandeDeSubventionUid(actionASupprimer.state.demandeDeSubventionUid))
    if(result)
    {
      return 'OK'
    }

    return 'supprimerActionErreurInconnue'
  }
}
type Failure = 'existeSubventionNonSupprimable' | 'suppressionActionNonAutorisee' | 'supprimerActionErreurInconnue'
type Command = Readonly<{
  uidActionASupprimer: string
}>
