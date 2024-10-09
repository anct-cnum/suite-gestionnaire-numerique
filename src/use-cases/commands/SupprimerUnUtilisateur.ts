import {
  DropUtilisateurRepository,
  FindUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'

export class SupprimerUnUtilisateur implements CommandHandler<Command> {
  readonly #repository: Repository

  constructor(repository: Repository) {
    this.#repository = repository
  }

  async execute({
    utilisateurCourantUid,
    utilisateurASupprimerUid,
  }: Command): ResultAsync<SupprimerUnUtilisateurFailure> {
    const utilisateurCourant = await this.#repository.find(utilisateurCourantUid)
    if (!utilisateurCourant) {
      return 'compteConnecteInexistant'
    }
    const utilisateurASupprimer = await this.#repository.find(utilisateurASupprimerUid)
    if (!utilisateurASupprimer) {
      return 'compteASupprimerInexistant'
    }
    if (!utilisateurCourant.peutGerer(utilisateurASupprimer)) {
      return 'suppressionNonAutorisee'
    }
    return (await this.#repository.drop(utilisateurASupprimer))
      ? 'OK'
      : 'compteASupprimerDejaSupprime'
  }
}

export type SupprimerUnUtilisateurFailure =
  | 'compteConnecteInexistant'
  | 'compteASupprimerInexistant'
  | 'suppressionNonAutorisee'
  | 'compteASupprimerDejaSupprime'

type Command = Readonly<{
  utilisateurCourantUid: string
  utilisateurASupprimerUid: string
}>

interface Repository extends FindUtilisateurRepository, DropUtilisateurRepository {}
