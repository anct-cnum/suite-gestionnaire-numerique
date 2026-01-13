import { CommandHandler, ResultAsync } from '../CommandHandler'

export interface ContactReferentRepository {
  updateContactReferent(
    structureId: number,
    contactReferent: {
      email: string
      fonction: string
      nom: string
      prenom: string
      telephone: string
    }
  ): Promise<void>
}

export class ModifierContactReferentStructure implements CommandHandler<Command, Failure> {
  readonly #contactReferentRepository: ContactReferentRepository

  constructor(contactReferentRepository: ContactReferentRepository) {
    this.#contactReferentRepository = contactReferentRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const { contactReferent, structureId } = command

    await this.#contactReferentRepository.updateContactReferent(structureId, contactReferent)

    return 'OK'
  }
}

type Command = Readonly<{
  contactReferent: Readonly<{
    email: string
    fonction: string
    nom: string
    prenom: string
    telephone: string
  }>
  structureId: number
}>

type Failure = 'OK'
