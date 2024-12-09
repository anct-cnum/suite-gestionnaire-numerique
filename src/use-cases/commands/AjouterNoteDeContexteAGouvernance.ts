import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid, NoteDeContexte } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'

export class AjouterNoteDeContexteAGouvernance implements CommandHandler<Command> {
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #date: Date

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    utilisateurRepository: UtilisateurRepository,
    date = new Date()
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#date = date
  }

  async execute({ contenu, uidGouvernance, uidUtilisateur }: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.find(uidUtilisateur)
    if (!utilisateurCourant) {
      return 'utilisateurInexistant'
    }
    const gouvernance = await this.#gouvernanceRepository.find(new GouvernanceUid(uidGouvernance))
    if (!gouvernance) {
      return 'gouvernanceInexistante'
    }
    if (!gouvernance.peutSeFaireGerer(utilisateurCourant)) {
      return 'utilisateurNePeutPasAjouterNoteDeContexte'
    }
    gouvernance.ajouterNoteDeContexte(
      new NoteDeContexte(this.#date, new UtilisateurUid(utilisateurCourant.state.uid), contenu)
    )
    await this.#gouvernanceRepository.update(gouvernance)
    return 'OK'
  }
}

type Failure = 'gouvernanceInexistante' | 'utilisateurInexistant' | 'utilisateurNePeutPasAjouterNoteDeContexte'

type Command = Readonly<{
  contenu: string
  uidUtilisateur: string
  uidGouvernance: string
}>

interface GouvernanceRepository extends FindGouvernanceRepository, UpdateGouvernanceRepository {}

type UtilisateurRepository = FindUtilisateurRepository
