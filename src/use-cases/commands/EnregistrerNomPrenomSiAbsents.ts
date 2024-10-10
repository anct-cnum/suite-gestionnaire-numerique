import {
  FindUtilisateurRepository,
  UpdateUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'

export class EnregistrerNomPrenomSiAbsents implements CommandHandler<Command, Failure, Success> {
  readonly #repository: Repository

  constructor(repository: Repository) {
    this.#repository = repository
  }

  async execute({
    actuels,
    corriges,
    uid,
    valeurNomOuPrenomAbsent,
  }: Command): ResultAsync<Failure, Success> {
    const isPrenomAbsent = valeurNomOuPrenomAbsent === actuels.prenom
    const isNomAbsent = valeurNomOuPrenomAbsent === actuels.nom
    if (!isPrenomAbsent && !isNomAbsent) {
      return 'okSansMiseAJour'
    }
    const utilisateur = await this.#repository.find(uid)
    if (!utilisateur) {
      return Promise.resolve('compteInexistant')
    }
    if (isPrenomAbsent) {
      if (valeurNomOuPrenomAbsent === corriges.prenom) {
        return 'miseAJourInvalide'
      }
      utilisateur.changerPrenom(corriges.prenom)
    }
    if (isNomAbsent) {
      if (valeurNomOuPrenomAbsent === corriges.nom) {
        return 'miseAJourInvalide'
      }
      utilisateur.changerNom(corriges.nom)
    }
    return this.#repository.update(utilisateur).then(() => 'okAvecMiseAJour')
  }
}

type Command = Readonly<{
  actuels: Readonly<{
    nom: string
    prenom: string
  }>
  corriges: Readonly<{
    nom: string
    prenom: string
  }>
  valeurNomOuPrenomAbsent: string
  uid: string
}>

type Failure = 'compteInexistant' | 'miseAJourInvalide'

type Success = 'okAvecMiseAJour' | 'okSansMiseAJour'

interface Repository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
