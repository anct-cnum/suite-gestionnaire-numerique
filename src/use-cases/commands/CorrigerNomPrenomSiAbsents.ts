import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import config from '@/use-cases/config.json'

export class CorrigerNomPrenomSiAbsents implements CommandHandler<Command, Failure, Success> {
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #valeurNomOuPrenomAbsent: string

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
    this.#valeurNomOuPrenomAbsent = config.absenceNomOuPrenom
  }

  async handle(command: Command): ResultAsync<Failure, Success> {
    const { actuels, corriges, uidUtilisateurCourant } = command
    const isPrenomAbsent = this.#valeurNomOuPrenomAbsent === actuels.prenom
    const isNomAbsent = this.#valeurNomOuPrenomAbsent === actuels.nom
    if (!isPrenomAbsent && !isNomAbsent) {
      return 'okSansMiseAJour'
    }

    const utilisateurCourant = await this.#utilisateurRepository.get(uidUtilisateurCourant)
    if (isPrenomAbsent) {
      if (this.#valeurNomOuPrenomAbsent === corriges.prenom) {
        return 'miseAJourInvalide'
      }
      utilisateurCourant.changerPrenom(corriges.prenom)
    }

    if (isNomAbsent) {
      if (this.#valeurNomOuPrenomAbsent === corriges.nom) {
        return 'miseAJourInvalide'
      }
      utilisateurCourant.changerNom(corriges.nom)
    }

    return this.#utilisateurRepository.update(utilisateurCourant).then(() => 'okAvecMiseAJour')
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
  uidUtilisateurCourant: string
}>

type Failure = 'miseAJourInvalide'

type Success = 'okAvecMiseAJour' | 'okSansMiseAJour'

interface UtilisateurRepository extends GetUtilisateurRepository, UpdateUtilisateurRepository {}
