import { CommandHandler, ResultAsync } from '../CommandHandler'

export class ModifierMesInformationsPersonnelles implements CommandHandler<
  MesInformationsPersonnellesModifiees,
  ModificationUtilisateurFailure
> {
  readonly #modificationUtilisateurGateway: ModificationUtilisateurGateway

  constructor(modificationUtilisateurGateway: ModificationUtilisateurGateway) {
    this.#modificationUtilisateurGateway = modificationUtilisateurGateway
  }

  async execute(command: MesInformationsPersonnellesModifiees): ResultAsync<
    ModificationUtilisateurFailure
  > {
    return this.#modificationUtilisateurGateway
      .update(command)
      .then((result) => (result ? 'OK' : 'compteInexistant'))
  }
}

export interface ModificationUtilisateurGateway {
  update: (mesInformationsPersonnellesModifiees: MesInformationsPersonnellesModifiees) => Promise<boolean>
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
