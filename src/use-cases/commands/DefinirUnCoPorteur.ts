import * as Sentry from '@sentry/nextjs'

import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GouvernanceUid } from '@/domain/Gouvernance'
import { MembreFailure, MembreUid, Role, Statut } from '@/domain/Membre'
import { MembreCandidat } from '@/domain/MembreCandidat'
import { MembreConfirme } from '@/domain/MembreConfirme'
import { StructureUid } from '@/domain/Structure'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'
import { EmailGatewayFactory } from '@/use-cases/commands/shared/EmailGateway'
import { GetGouvernanceRepository } from '@/use-cases/commands/shared/GouvernanceRepository'
import {
  ContactData,
  GetMembreContactsRepository,
  GetMembreRepository,
  UpdateMembreRepository,
} from '@/use-cases/commands/shared/MembreRepository'
import {
  AddUtilisateurRepository,
  FindUtilisateurByEmailRepository,
  GetUtilisateurRepository,
} from '@/use-cases/commands/shared/UtilisateurRepository'

export class DefinirUnCoPorteur implements CommandHandler<Command> {
  private readonly date: Date
  private readonly emailGatewayFactory: EmailGatewayFactory
  private readonly gouvernanceRepository: GetGouvernanceRepository
  private readonly membreRepository: MembreRepositoryForDefinirUnCoPorteur
  private readonly utilisateurRepository: UtilisateurRepositoryForDefinirUnCoPorteur

  constructor(
    membreRepository: MembreRepositoryForDefinirUnCoPorteur,
    utilisateurRepository: UtilisateurRepositoryForDefinirUnCoPorteur,
    gouvernanceRepository: GetGouvernanceRepository,
    emailGatewayFactory: EmailGatewayFactory,
    date: Date
  ) {
    this.membreRepository = membreRepository
    this.utilisateurRepository = utilisateurRepository
    this.gouvernanceRepository = gouvernanceRepository
    this.emailGatewayFactory = emailGatewayFactory
    this.date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    const user = await this.utilisateurRepository.get(command.uidUtilisateurConnecte)
    const gouvernance = await this.gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    if(!gouvernance.peutEtreGereePar(user)){
      return 'UtilisateurNonAutorise'
    }
    const membre = await this.membreRepository.get(command.uidMembre)

    if(membre instanceof MembreCandidat){
      return 'MembreDoitEtreConfirmer'
    }

    if(membre.state.roles.includes('coporteur')) {
      return 'MembreDéjàCoPorteur'
    }

    const nouveauxRoles = [...membre.state.roles, 'coporteur']

    const membreConfirmer= new MembreConfirme(
      new MembreUid(membre.state.uid.value),
      membre.state.nom,
      nouveauxRoles.map(role => new Role(role)),
      new GouvernanceUid(membre.state.uidGouvernance.value),
      new Statut(membre.state.statut),
      new StructureUid(membre.state.uidStructure.value)
    )

    await this.membreRepository.update(membreConfirmer)

    // Inviter les contacts du membre en tant qu'utilisateurs
    await this.inviterLesContactsEnTantQueUtilisateurs(
      command.uidMembre,
      membre.state.uidStructure.value,
      gouvernance.state.departement
    )

    return 'OK'
  }

  /**
   * Invite les contacts (référent et technique) du membre en tant qu'utilisateurs de la plateforme.
   *
   * Gère les scénarios suivants :
   * - Si l'utilisateur n'existe pas : le créer et l'inviter
   * - Si l'utilisateur existe et est lié à la même structure : ne rien faire
   * - Si l'utilisateur existe et est lié à une autre structure : logger dans Sentry et ne rien faire
   */
  private async inviterLesContactsEnTantQueUtilisateurs(
    membreUid: string,
    structureId: number,
    departement: { code: string; nom: string }
  ): Promise<void> {
    const contacts = await this.membreRepository.getContacts(membreUid)

    // Traiter le contact référent
    await this.traiterContact(contacts.contact, structureId, departement, 'referent', membreUid)

    // Traiter le contact technique si présent
    if (contacts.contactTechnique) {
      await this.traiterContact(contacts.contactTechnique, structureId, departement, 'technique', membreUid)
    }
  }

  /**
   * Traite un contact pour créer/inviter l'utilisateur si nécessaire
   */
  private async traiterContact(
    contact: ContactData,
    structureId: number,
    departement: { code: string; nom: string },
    typeContact: 'referent' | 'technique',
    membreUid: string
  ): Promise<void> {
    const utilisateurExistant = await this.utilisateurRepository.findByEmail(contact.email)

    if (utilisateurExistant) {
      // L'utilisateur existe déjà
      const structureUtilisateur = utilisateurExistant.state.structureUid?.value

      if (structureUtilisateur === structureId) {
        // Utilisateur déjà lié à la même structure → RAS
        return
      } 
      // Utilisateur lié à une autre structure → Logger dans Sentry
      Sentry.captureMessage('Contact coporteur déjà utilisateur d\'une autre structure', {
        extra: {
          contactEmail: contact.email,
          contactNom: contact.nom,
          contactPrenom: contact.prenom,
          membreUid,
          structureActuelle: structureUtilisateur,
          structureCible: structureId,
          typeContact,
        },
        level: 'warning',
        tags: {
          location: 'DefinirUnCoPorteur',
          scenario: 'contact_utilisateur_autre_structure',
        },
      })
      return
    }

    // L'utilisateur n'existe pas → Créer et inviter
    const nouvelUtilisateur = new UtilisateurFactory({
      departement: {
        code: departement.code,
        codeRegion: '', // Sera rempli par le système
        nom: departement.nom,
      },
      emailDeContact: contact.email,
      groupementUid: undefined,
      inviteLe: this.date,
      isSuperAdmin: false,
      nom: contact.nom,
      prenom: contact.prenom,
      region: undefined,
      structureUid: structureId,
      telephone: '',
      uid: { email: contact.email, value: contact.email },
    }).create('Gestionnaire structure')

    const utilisateurCree = await this.utilisateurRepository.add(nouvelUtilisateur)

    if (utilisateurCree) {
      // Envoyer l'email d'invitation
      const emailGateway = this.emailGatewayFactory(false)
      await emailGateway.send({
        email: contact.email,
        nom: contact.nom,
        prenom: contact.prenom,
      })
    }
  }
}

type Failure =
  | 'MembreDéjàCoPorteur'
  | 'MembreDoitEtreConfirmer'
  | 'UtilisateurNonAutorise'
  | MembreFailure

type Command = Readonly<{
  uidGouvernance: string
  uidMembre: string
  uidUtilisateurConnecte: string
}>

type MembreRepositoryForDefinirUnCoPorteur = GetMembreContactsRepository & GetMembreRepository & UpdateMembreRepository

type UtilisateurRepositoryForDefinirUnCoPorteur = AddUtilisateurRepository
                                                  & FindUtilisateurByEmailRepository
                                                  & GetUtilisateurRepository
