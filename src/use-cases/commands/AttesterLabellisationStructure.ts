import { CommandHandler, ResultAsync } from '../CommandHandler'

// Durée de vie du label : 1 an (décision non ferme — calculée ici, jamais stockée en base).
export function estLabelConumActif(derniereAttestation: Date | null, now: Date): boolean {
  if (derniereAttestation === null) {
    return false
  }
  return now < dateRenouvellementLabelConum(derniereAttestation)
}

// Une attestation = une ligne (append-only) : le renouvellement du label
// insère une nouvelle attestation, le label actif se déduit de la plus récente.
export class AttesterLabellisationStructure implements CommandHandler<Command, Failure> {
  readonly #date: Date
  readonly #emailConfirmationGateway: EmailConfirmationLabellisationGateway
  readonly #structureLabellisationRepository: StructureLabellisationRepository

  constructor(
    structureLabellisationRepository: StructureLabellisationRepository,
    emailConfirmationGateway: EmailConfirmationLabellisationGateway,
    date: Date
  ) {
    this.#structureLabellisationRepository = structureLabellisationRepository
    this.#emailConfirmationGateway = emailConfirmationGateway
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

    // L'email de confirmation n'est envoyé qu'après l'enregistrement effectif de l'attestation ;
    // le gateway ne lève jamais : un échec d'envoi n'annule pas la labellisation.
    await this.#emailConfirmationGateway.envoyer({
      dateRenouvellement: dateRenouvellementLabelConum(this.#date),
      structureId: command.structureId,
    })

    return 'OK'
  }
}

// Envoie l'email de confirmation aux contacts de la structure labellisée.
// L'implémentation ne doit jamais lever : l'erreur d'envoi est tracée techniquement, sans annuler la labellisation.
export interface EmailConfirmationLabellisationGateway {
  envoyer(
    confirmation: Readonly<{
      dateRenouvellement: Date
      structureId: number
    }>
  ): Promise<void>
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

function dateRenouvellementLabelConum(attestation: Date): Date {
  const renouvellement = new Date(attestation)
  renouvellement.setFullYear(renouvellement.getFullYear() + 1)
  return renouvellement
}

type Command = Readonly<{
  structureId: number
  utilisateurId: number
}>
