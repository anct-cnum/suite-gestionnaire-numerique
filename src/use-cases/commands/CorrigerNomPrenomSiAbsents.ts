import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import config from '@/use-cases/config.json'

export class CorrigerNomPrenomSiAbsents implements CommandHandler<Command, Failure, Success> {
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #valeurNomOuPrenomAbsent: string

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
    this.#valeurNomOuPrenomAbsent = config.absenceNomOuPrenom
  }

  async execute({ actuels, corriges, uid }: Command): ResultAsync<Failure, Success> {
    const isPrenomAbsent = this.#valeurNomOuPrenomAbsent === actuels.prenom
    const isNomAbsent = this.#valeurNomOuPrenomAbsent === actuels.nom
    if (!isPrenomAbsent && !isNomAbsent) {
      return 'okSansMiseAJour'
    }
    const utilisateur = await this.#utilisateurRepository.find(uid)
    if (!utilisateur) {
      return Promise.resolve('compteInexistant')
    }
    if (isPrenomAbsent) {
      if (this.#valeurNomOuPrenomAbsent === corriges.prenom) {
        return 'miseAJourInvalide'
      }
      utilisateur.changerPrenom(corriges.prenom)
    }
    if (isNomAbsent) {
      if (this.#valeurNomOuPrenomAbsent === corriges.nom) {
        return 'miseAJourInvalide'
      }
      utilisateur.changerNom(corriges.nom)
    }
    return this.#utilisateurRepository.update(utilisateur).then(() => 'okAvecMiseAJour')
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
  uid: string
}>

type Failure = 'compteInexistant' | 'miseAJourInvalide'

type Success = 'okAvecMiseAJour' | 'okSansMiseAJour'

interface UtilisateurRepository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
