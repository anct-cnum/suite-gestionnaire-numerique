import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UpdateLieuInclusionServicesModaliteRepository } from './shared/LieuInclusionRepository'
import { StructureUid } from '@/domain/Structure'

export class ModifierLieuInclusionServicesModalite implements CommandHandler<Command> {
  readonly #lieuInclusionRepository: LieuInclusionRepository

  constructor(lieuInclusionRepository: LieuInclusionRepository) {
    this.#lieuInclusionRepository = lieuInclusionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions est effectuée au niveau des Server Actions
    await this.#lieuInclusionRepository.updateServicesModalite({
      email: command.email,
      fraisACharge: command.fraisACharge,
      modalitesAcces: command.modalitesAcces,
      structureUid: new StructureUid(Number(command.structureId)),
      telephone: command.telephone,
    })

    return 'OK'
  }
}

type Failure = 'utilisateurNePeutPasModifierLieu' // À étendre avec d'autres cas d'erreur si nécessaire

type Command = Readonly<{
  email?: string
  fraisACharge: ReadonlyArray<string>
  modalitesAcces: ReadonlyArray<string>
  structureId: string
  telephone?: string
  // uidEditeur: string // À ajouter pour la gestion des permissions
}>

type LieuInclusionRepository = UpdateLieuInclusionServicesModaliteRepository
