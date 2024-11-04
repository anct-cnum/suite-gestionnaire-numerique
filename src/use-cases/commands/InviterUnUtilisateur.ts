import { AddUtilisateurRepository } from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { TypologieRole } from '@/domain/Role'
import { Utilisateur } from '@/domain/Utilisateur'

export class InviterUnUtilisateur implements CommandHandler<InviterUnUtilisateurCommand> {
  readonly #repository: AddUtilisateurRepository

  constructor(repository: AddUtilisateurRepository) {
    this.#repository = repository
  }

  async execute(command: InviterUnUtilisateurCommand): ResultAsync<InviterUnUtilisateurFailure> {
    const utilisateurCourant = await this.#repository.find(command.uidUtilisateurCourant)
    if (!utilisateurCourant) {
      return 'KO'
    }
    const utilisateurACreer = Utilisateur.create({
      email: command.email,
      isSuperAdmin: false,
      nom: command.nom,
      organisation: command.organisation,
      prenom: command.prenom,
      role: command.role,
      uid: command.email,
    })
    if (!utilisateurCourant.peutGerer(utilisateurACreer)) {
      return 'KO'
    }
    const isUtilisateurCreated = await this.#repository.add(utilisateurACreer)
    return isUtilisateurCreated ? 'OK' : 'emailExistant'
  }
}

type InviterUnUtilisateurCommand = Readonly<{
  prenom: string
  nom: string
  email: string
  role: TypologieRole
  organisation?: string
  uidUtilisateurCourant: string
}>

export type InviterUnUtilisateurFailure = 'KO' | 'emailExistant'
