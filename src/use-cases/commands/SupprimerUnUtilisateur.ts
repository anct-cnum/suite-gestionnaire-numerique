import {
  DropUtilisateurRepository,
  FindUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UtilisateurUid } from '@/domain/Utilisateur'

export class SupprimerUnUtilisateur implements CommandHandler<Command> {
  readonly #repository: Repository

  constructor(repository: Repository) {
    this.#repository = repository
  }

  async execute({
    utilisateurCourantUid,
    utilisateurASupprimerUid,
  }: Command): ResultAsync<SupprimerUnUtilisateurFailure> {
    const utilisateurCourant = await this.#repository.find(UtilisateurUid.from(utilisateurCourantUid))
    if (!utilisateurCourant) {
      return 'compteConnecteInexistant'
    }
    const utilisateurASupprimer = await this.#repository.find(UtilisateurUid.from(utilisateurASupprimerUid))
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
