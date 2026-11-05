import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UpdateLieuInclusionVisibiliteCartographieRepository } from './shared/LieuInclusionRepository'
import { StructureUid } from '@/domain/Structure'

// #1495 : un lieu sans adresse BAN ne peut pas être rendu visible sur la cartographie
// nationale (règle Coop) — la bascule ne peut que le masquer, jamais le publier.
export class ModifierLieuInclusionVisibiliteCartographie implements CommandHandler<Command> {
  readonly #date: Date
  readonly #lieuInclusionRepository: LieuInclusionRepository

  constructor(lieuInclusionRepository: LieuInclusionRepository, date: Date) {
    this.#lieuInclusionRepository = lieuInclusionRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    const structureUid = new StructureUid(Number(command.lieuId))

    if (command.visiblePourCartographie && !(await this.#lieuInclusionRepository.aUneAdresseBan(structureUid))) {
      return 'adresseBanAbsente'
    }

    await this.#lieuInclusionRepository.updateVisibiliteCartographie({
      date: this.#date,
      structureUid,
      visiblePourCartographie: command.visiblePourCartographie,
    })

    return 'OK'
  }
}

export type Failure = 'adresseBanAbsente'

type Command = Readonly<{
  lieuId: string
  visiblePourCartographie: boolean
}>

type LieuInclusionRepository = UpdateLieuInclusionVisibiliteCartographieRepository
