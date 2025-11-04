import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UpdateLieuInclusionDescriptionRepository } from './shared/LieuInclusionRepository'
import { StructureUid } from '@/domain/Structure'

export class ModifierLieuInclusionDescription implements CommandHandler<Command> {
  readonly #lieuInclusionRepository: LieuInclusionRepository

  constructor(lieuInclusionRepository: LieuInclusionRepository) {
    this.#lieuInclusionRepository = lieuInclusionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions est effectuée au niveau des Server Actions
    let itineranceArray: ReadonlyArray<string> | undefined
    if (command.itinerance === undefined) {
      itineranceArray = undefined
    } else if (command.itinerance === '') {
      itineranceArray = []
    } else {
      itineranceArray = command.itinerance.split(',').map(item => item.trim()).filter(item => item !== '')
    }

    await this.#lieuInclusionRepository.updateDescription({
      horaires: command.horaires,
      itinerance: itineranceArray,
      presentationDetail: command.presentationDetail,
      presentationResume: command.presentationResume,
      priseRdvUrl: command.priseRdvUrl,
      structureUid: new StructureUid(Number(command.structureId)),
      typologie: command.typologie,
      websiteUrl: command.websiteUrl,
    })

    return 'OK'
  }
}

type Failure = 'utilisateurNePeutPasModifierLieu' // À étendre avec d'autres cas d'erreur si nécessaire

type Command = Readonly<{
  horaires?: string
  itinerance?: string
  presentationDetail?: string
  presentationResume?: string
  priseRdvUrl?: string
  structureId: string
  typologie?: string
  websiteUrl?: string
  // uidEditeur: string // À ajouter pour la gestion des permissions
}>

type LieuInclusionRepository = UpdateLieuInclusionDescriptionRepository
