import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { UtilisateurFailure } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class ModifierMesInformationsPersonnelles implements CommandHandler<Command, Failure> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async execute(command: Command): ResultAsync<Failure> {
    const {
      modification: { nom, prenom, emailDeContact: email, telephone },
      uidUtilisateurCourant,
    } = command

    const utilisateurCourant = await this.#utilisateurRepository.find(uidUtilisateurCourant)

    const changerPrenomResult = utilisateurCourant.changerPrenom(prenom)
    if (!isOk(changerPrenomResult)) {
      return changerPrenomResult
    }

    const changerNomResult = utilisateurCourant.changerNom(nom)
    if (!isOk(changerNomResult)) {
      return changerNomResult
    }

    const changerEmailResult = utilisateurCourant.changerEmail(email)
    if (!isOk(changerEmailResult)) {
      return changerEmailResult
    }

    const changerTelephoneResult = utilisateurCourant.changerTelephone(telephone)
    if (!isOk(changerTelephoneResult)) {
      return changerTelephoneResult
    }
    await this.#utilisateurRepository.update(utilisateurCourant)

    return 'OK'
  }
}

type Command = Readonly<{
  modification: Readonly<{
    emailDeContact: string
    nom: string
    prenom: string
    telephone: string
  }>
  uidUtilisateurCourant: string
}>

type Failure = UtilisateurFailure

interface UtilisateurRepository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
