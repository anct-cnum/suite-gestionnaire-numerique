import { DropUtilisateurRepository } from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'

export class SupprimerUnUtilisateur implements CommandHandler<Command> {
  readonly #dropUtilisateurRepository: DropUtilisateurRepository

  constructor(dropUtilisateurRepository: DropUtilisateurRepository) {
    this.#dropUtilisateurRepository = dropUtilisateurRepository
  }

  async execute({
    utilisateurCourantUid,
    utilisateurASupprimerUid,
  }: Command): ResultAsync<SupprimerUnUtilisateurFailure> {
    const utilisateurCourant = await this.#dropUtilisateurRepository.find(utilisateurCourantUid)
    if (!utilisateurCourant) {
      return 'compteConnecteInexistant'
    }
    const utilisateurASupprimer = await this.#dropUtilisateurRepository.find(utilisateurASupprimerUid)
    if (!utilisateurASupprimer) {
      return 'compteASupprimerInexistant'
    }
    if (!utilisateurCourant.peutGerer(utilisateurASupprimer)) {
      return 'suppressionNonAutorisee'
    }
    return (await this.#dropUtilisateurRepository.drop(utilisateurASupprimer))
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
