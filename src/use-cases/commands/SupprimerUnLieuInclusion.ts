import { CommandHandler, ResultAsync } from '../CommandHandler'
import { SupprimerLieuInclusionRepository } from './shared/LieuInclusionRepository'
import { StructureUid } from '@/domain/Structure'

export class SupprimerUnLieuInclusion implements CommandHandler<Command> {
  readonly #date: Date
  readonly #lieuInclusionRepository: SupprimerLieuInclusionRepository

  constructor(lieuInclusionRepository: SupprimerLieuInclusionRepository, date: Date) {
    this.#lieuInclusionRepository = lieuInclusionRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    await this.#lieuInclusionRepository.supprimer({
      date: this.#date,
      structureUid: new StructureUid(Number(command.lieuId)),
    })

    return 'OK'
  }
}

type Failure = 'utilisateurNePeutPasSupprimerLieu'

type Command = Readonly<{
  lieuId: string
}>
