import { CommandHandler, ResultAsync } from '../CommandHandler'
import {
  FindUtilisateurRepository,
  UpdateUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { UtilisateurFailure, UtilisateurUid } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class ModifierMesInformationsPersonnelles implements CommandHandler<
  MesInformationsPersonnellesModifiees,
  ModificationUtilisateurFailure> {
  readonly #repository: Repository

  constructor(repository: Repository) {
    this.#repository = repository
  }

  async execute(
    command: MesInformationsPersonnellesModifiees
  ): ResultAsync<ModificationUtilisateurFailure> {
    const {
      modification: { nom, prenom, emailDeContact: email, telephone },
      uid,
    } = command
    const utilisateur = await this.#repository.find(UtilisateurUid.from(uid))
    if (!utilisateur) {
      return 'compteInexistant'
    }
    const changerPrenomResult = utilisateur.changerPrenom(prenom)
    if (!isOk(changerPrenomResult)) {
      return changerPrenomResult
    }
    const changerNomResult = utilisateur.changerNom(nom)
    if (!isOk(changerNomResult)) {
      return changerNomResult
    }
    const changerEmailResult = utilisateur.changerEmail(email)
    if (!isOk(changerEmailResult)) {
      return changerEmailResult
    }
    const changerTelephoneResult = utilisateur.changerTelephone(telephone)
    if (!isOk(changerTelephoneResult)) {
      return changerTelephoneResult
    }
    await this.#repository.update(utilisateur)
    return 'OK'
  }
}

export type MesInformationsPersonnellesModifiees = Readonly<{
  modification: Readonly<{
    emailDeContact: string
    nom: string
    prenom: string
    telephone: string
  }>
  uid: string
}>

export type ModificationUtilisateurFailure = 'compteInexistant' | UtilisateurFailure

interface Repository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
