import { CommandHandler, ResultAsync } from '../CommandHandler'

// Durée de vie du label : 1 an (décision non ferme — calculée ici, jamais stockée en base).
export function estLabelConumActif(derniereAttestation: Date | null, now: Date): boolean {
  if (derniereAttestation === null) {
    return false
  }
  const expiration = new Date(derniereAttestation)
  expiration.setFullYear(expiration.getFullYear() + 1)
  return now < expiration
}

// Une attestation = une ligne (append-only) : le renouvellement du label
// insère une nouvelle attestation, le label actif se déduit de la plus récente.
export class AttesterLabellisationStructure implements CommandHandler<Command, Failure> {
  readonly #date: Date
  readonly #structureLabellisationRepository: StructureLabellisationRepository

  constructor(structureLabellisationRepository: StructureLabellisationRepository, date: Date) {
    this.#structureLabellisationRepository = structureLabellisationRepository
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    // La validation des permissions et de l'éligibilité est effectuée au niveau de la Server Action.
    const derniereAttestation = await this.#structureLabellisationRepository.derniereAttestation(command.structureId)
    if (estLabelConumActif(derniereAttestation, this.#date)) {
      return 'dejaLabellisee'
    }

    await this.#structureLabellisationRepository.attester({
      dateAttestation: this.#date,
      structureId: command.structureId,
      utilisateurId: command.utilisateurId,
    })

    return 'OK'
  }
}

export interface StructureLabellisationRepository {
  attester(
    attestation: Readonly<{
      dateAttestation: Date
      structureId: number
      utilisateurId: number
    }>
  ): Promise<void>
  derniereAttestation(structureId: number): Promise<Date | null>
}

export type Failure = 'dejaLabellisee'

type Command = Readonly<{
  structureId: number
  utilisateurId: number
}>
