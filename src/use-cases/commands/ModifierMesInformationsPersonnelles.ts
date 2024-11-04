import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UtilisateurUid } from '@/domain/Utilisateur'

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
    const utilisateur = await this.#repository.find(UtilisateurUid.from(command.uid))
    if (!utilisateur) {
      return 'compteInexistant'
    }
    utilisateur.changerPrenom(command.modification.prenom)
    utilisateur.changerNom(command.modification.nom)
    utilisateur.changerEmail(command.modification.email)
    utilisateur.changerTelephone(command.modification.telephone)
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
