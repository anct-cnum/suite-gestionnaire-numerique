import { CommandHandler, ResultAsync } from '../CommandHandler'
import { ModifierNomStructureRepository } from './shared/StructureRepository'

export class ModifierNomStructure implements CommandHandler<Command> {
  readonly #structureRepository: ModifierNomStructureRepository

  constructor(structureRepository: ModifierNomStructureRepository) {
    this.#structureRepository = structureRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions est effectuée au niveau de la Server Action.
    const nomActuel = await this.#structureRepository.lireNomStructure(command.structureId)
    if (nomActuel === null) {
      return 'structureIntrouvable'
    }

    // Règle métier : on n'override pas le nom d'une structure canonique (denomination_antenne
    // null) — elle affiche déjà le nom officiel SIRENE, et la renommer la transformerait en antenne.
    if (nomActuel.denominationAntenne === null) {
      return 'structureCanoniqueNonRenommable'
    }

    // Le nom d'affichage est porté par denomination_antenne ; vidé, on l'efface (null) pour
    // retomber sur le nom SIRENE (denomination_sirene).
    const nomAffichage = command.nomAffichage.trim()
    const succes = await this.#structureRepository.modifierNom({
      denominationAntenne: nomAffichage === '' ? null : nomAffichage,
      structureId: command.structureId,
    })

    return succes ? 'OK' : 'nomDejaUtilise'
  }
}

export type Failure = 'nomDejaUtilise' | 'structureCanoniqueNonRenommable' | 'structureIntrouvable'

type Command = Readonly<{
  nomAffichage: string
  structureId: number
}>
