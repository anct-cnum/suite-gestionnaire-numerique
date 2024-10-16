import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'

export class ModifierMesInformationsPersonnelles implements CommandHandler<
  MesInformationsPersonnellesModifiees,
  ModificationUtilisateurFailure
> {
  readonly #repository: Repository

  constructor(repository: Repository) {
    this.#repository = repository
  }

  async execute(command: MesInformationsPersonnellesModifiees): ResultAsync<
    ModificationUtilisateurFailure
  > {
    const utilisateur = await this.#repository.find(command.uid)
    if (!utilisateur) {
      return 'compteInexistant'
    }
    utilisateur.changerPrenom(command.modification.prenom)
    utilisateur.changerNom(command.modification.nom)
    utilisateur.changerEmail(command.modification.email)
    await this.#repository.update(utilisateur)
    return 'OK'
  }
}

export type MesInformationsPersonnellesModifiees = Readonly<{
  modification: Readonly<{
    email: string
    nom: string
    prenom: string
    telephone: string
  }>,
  uid: string
}>

export type ModificationUtilisateurFailure = 'compteInexistant'

interface Repository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
