import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UpdateLieuInclusionServicesTypePublicRepository } from './shared/LieuInclusionRepository'
import { StructureUid } from '@/domain/Structure'

export class ModifierLieuInclusionServicesTypePublic implements CommandHandler<Command> {
  readonly #lieuInclusionRepository: LieuInclusionRepository

  constructor(lieuInclusionRepository: LieuInclusionRepository) {
    this.#lieuInclusionRepository = lieuInclusionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions est effectuée au niveau des Server Actions
    await this.#lieuInclusionRepository.updateServicesTypePublic({
      priseEnChargeSpecifique: command.priseEnChargeSpecifique,
      publicsSpecifiquementAdresses: command.publicsSpecifiquementAdresses,
      structureUid: new StructureUid(Number(command.structureId)),
    })

    return 'OK'
  }
}

type Failure = 'utilisateurNePeutPasModifierLieu' // À étendre avec d'autres cas d'erreur si nécessaire

type Command = Readonly<{
  priseEnChargeSpecifique: ReadonlyArray<string>
  publicsSpecifiquementAdresses: ReadonlyArray<string>
  structureId: string
  // uidEditeur: string // À ajouter pour la gestion des permissions
}>

type LieuInclusionRepository = UpdateLieuInclusionServicesTypePublicRepository
