import { CommandHandler, ResultAsync } from '../CommandHandler'
import { ModifierNomStructureRepository } from './shared/StructureRepository'

export class ModifierNomStructure implements CommandHandler<Command> {
  readonly #structureRepository: ModifierNomStructureRepository

  constructor(structureRepository: ModifierNomStructureRepository) {
    this.#structureRepository = structureRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions est effectuée au niveau de la Server Action.
    // Le nom d'affichage est porté par denomination_antenne ; vidé, on l'efface (null)
    // pour retomber sur le nom SIRENE (denomination_sirene).
    const nomAffichage = command.nomAffichage.trim()

    await this.#structureRepository.modifierNom({
      denominationAntenne: nomAffichage === '' ? null : nomAffichage,
      structureId: command.structureId,
    })

    return 'OK'
  }
}

type Failure = 'structureNonModifiee'

type Command = Readonly<{
  nomAffichage: string
  structureId: number
}>
