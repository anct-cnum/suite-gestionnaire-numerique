import { CommandHandler, ResultAsync } from '../CommandHandler'
import { EmailGateway, EmailGatewayFactory } from './shared/EmailGateway'
import { AddUtilisateurRepository, FindUtilisateurByEmailRepository, GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'

export class InviterContactsReferentsFne implements CommandHandler<Command> {
  readonly #contactReferentFneLoader: ContactReferentFneLoader
  readonly #date: Date
  readonly #emailGatewayFactory: EmailGatewayFactory
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    contactReferentFneLoader: ContactReferentFneLoader,
    emailGatewayFactory: EmailGatewayFactory,
    date: Date
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#contactReferentFneLoader = contactReferentFneLoader
    this.#emailGatewayFactory = emailGatewayFactory
    this.#date = date
  }

  async handle(command: Command): ResultAsync<string> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)
    const emailGateway = this.#emailGatewayFactory(utilisateurCourant.state.isSuperAdmin)
    const contacts = await this.#contactReferentFneLoader.getContactsReferentFne(command.structureId)

    await Promise.all(contacts.map(async (contact) =>
      this.#inviterContact(contact, command.structureId, emailGateway)))

    return 'OK'
  }

  async #inviterContact(
    contact: ContactReferentFne,
    structureId: number,
    emailGateway: EmailGateway
  ): Promise<void> {
    const utilisateurExistant = await this.#utilisateurRepository.findByEmail(contact.email)
    if (utilisateurExistant) {
      return
    }

    const utilisateurACreer = new UtilisateurFactory({
      emailDeContact: contact.email,
      inviteLe: this.#date,
      isSuperAdmin: false,
      nom: contact.nom,
      prenom: contact.prenom,
      structureUid: structureId,
      telephone: contact.telephone,
      uid: { email: contact.email, value: contact.email },
    }).create('Gestionnaire structure', String(structureId))

    const isUtilisateurCreeOuReactive = await this.#utilisateurRepository.add(utilisateurACreer)
    if (isUtilisateurCreeOuReactive) {
      await emailGateway.send({
        email: contact.email,
        nom: contact.nom,
        prenom: contact.prenom,
      })
    }
  }
}

export type ContactReferentFne = Readonly<{
  email: string
  nom: string
  prenom: string
  telephone: string
}>

export interface ContactReferentFneLoader {
  getContactsReferentFne(structureId: number): Promise<ReadonlyArray<ContactReferentFne>>
}

type Command = Readonly<{
  structureId: number
  uidUtilisateurCourant: string
}>

type UtilisateurRepository =
  AddUtilisateurRepository & FindUtilisateurByEmailRepository & GetUtilisateurRepository
