import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UpdateLieuInclusionServicesTypeAccompagnementRepository } from './shared/LieuInclusionRepository'
import { StructureUid } from '@/domain/Structure'

export class ModifierLieuInclusionServicesTypeAccompagnement implements CommandHandler<Command> {
  readonly #lieuInclusionRepository: LieuInclusionRepository

  constructor(lieuInclusionRepository: LieuInclusionRepository) {
    this.#lieuInclusionRepository = lieuInclusionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions est effectuée au niveau des Server Actions
    await this.#lieuInclusionRepository.updateServicesTypeAccompagnement({
      modalites: command.modalites,
      structureUid: new StructureUid(Number(command.structureId)),
      thematiques: command.thematiques,
      typesAccompagnement: command.typesAccompagnement,
    })

    return 'OK'
  }
}

type Failure = 'utilisateurNePeutPasModifierLieu' // À étendre avec d'autres cas d'erreur si nécessaire

type Command = Readonly<{
  modalites: ReadonlyArray<string>
  structureId: string
  thematiques: ReadonlyArray<string>
  typesAccompagnement: ReadonlyArray<string>
  // uidEditeur: string // À ajouter pour la gestion des permissions
}>

type LieuInclusionRepository = UpdateLieuInclusionServicesTypeAccompagnementRepository
