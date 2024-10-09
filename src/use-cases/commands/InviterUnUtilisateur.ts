import { AddUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '../../domain/Role'
import { Utilisateur } from '../../domain/Utilisateur'
import { CommandHandler, ResultAsync } from '../CommandHandler'

export class InviterUnUtilisateur implements CommandHandler<Command> {
  readonly #repository: AddUtilisateurRepository

  constructor(repository: AddUtilisateurRepository) {
    this.#repository = repository
  }

  async execute(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#repository.find(command.uidUtilisateurCourant)
    const utilisateurACreer = Utilisateur.createWithoutUid({
      email: command.email,
      isSuperAdmin: false,
      nom: command.nom,
      organisation: command.organisation,
      prenom: command.prenom,
      role: command.role,
    })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!utilisateurCourant!.peutGerer(utilisateurACreer)) {
      return 'KO'
    }
    return this.#repository.add(utilisateurACreer).then(() => 'OK')
  }
}

type Command = Readonly<{
  prenom: string
  nom: string
  email: string
  role: TypologieRole
  organisation?: string
  uidUtilisateurCourant: string
}>;

type Failure = 'KO'
