import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UpdateLieuInclusionVisibiliteCartographieRepository } from './shared/LieuInclusionRepository'
import { StructureUid } from '@/domain/Structure'

export class ModifierLieuInclusionVisibiliteCartographie implements CommandHandler<Command> {
  readonly #lieuInclusionRepository: LieuInclusionRepository

  constructor(lieuInclusionRepository: LieuInclusionRepository) {
    this.#lieuInclusionRepository = lieuInclusionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    await this.#lieuInclusionRepository.updateVisibiliteCartographie({
      structureUid: new StructureUid(Number(command.lieuId)),
      visiblePourCartographie: command.visiblePourCartographie,
    })

    return 'OK'
  }
}

type Failure = 'utilisateurNePeutPasModifierLieu'

type Command = Readonly<{
  lieuId: string
  visiblePourCartographie: boolean
}>

type LieuInclusionRepository = UpdateLieuInclusionVisibiliteCartographieRepository
