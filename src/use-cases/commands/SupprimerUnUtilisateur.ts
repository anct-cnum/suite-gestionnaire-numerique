import { DropUtilisateurRepository } from './shared/UtilisateurRepository'
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UtilisateurUid } from '@/domain/Utilisateur'

export class SupprimerUnUtilisateur implements CommandHandler<Command> {
  readonly #dropUtilisateurRepository: DropUtilisateurRepository

  constructor(dropUtilisateurRepository: DropUtilisateurRepository) {
    this.#dropUtilisateurRepository = dropUtilisateurRepository
  }

  async execute({
    utilisateurCourantUid,
    utilisateurASupprimerUid,
  }: Command): ResultAsync<SupprimerUnUtilisateurFailure> {
    const utilisateurCourant = await this.#dropUtilisateurRepository.find(UtilisateurUid.from(utilisateurCourantUid))
    if (!utilisateurCourant) {
      return 'compteConnecteInexistant'
    }
    const utilisateurASupprimer = await this.#dropUtilisateurRepository
      .find(UtilisateurUid.from(utilisateurASupprimerUid))
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
