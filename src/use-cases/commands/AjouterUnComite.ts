import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AddComiteRepository } from './shared/ComiteRepository'
import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { Comite, ComiteFailure, ComiteUid } from '@/domain/Comite'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class AjouterUnComite implements CommandHandler<Command> {
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #comiteRepository: ComiteRepository
  readonly #date: Date

  constructor(
    gouvernanceRepository: GouvernanceRepository,
    utilisateurRepository: UtilisateurRepository,
    comiteRepository: ComiteRepository,
    date: Date
  ) {
    this.#gouvernanceRepository = gouvernanceRepository
    this.#utilisateurRepository = utilisateurRepository
    this.#comiteRepository = comiteRepository
    this.#date = date
  }

  async execute({
    commentaire,
    date,
    frequence,
    type,
    uidGouvernance,
    uidUtilisateurCourant,
  }: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.find(uidUtilisateurCourant)
    if (!utilisateurCourant) {
      return 'utilisateurInexistant'
    }

    const dateDeCreation = this.#date
    const comite = Comite.create({
      commentaire,
      date: date === undefined ? undefined : new Date(date),
      dateDeCreation,
      dateDeModification: dateDeCreation,
      frequence,
      type,
      uid: String(this.#date.getTime()),
      uidUtilisateurCourant: utilisateurCourant.state.uid,
    })
    if (!(comite instanceof Comite)) {
      return comite
    }

    const gouvernance = await this.#gouvernanceRepository.find(new GouvernanceUid(uidGouvernance))
    if (!gouvernance) {
      return 'gouvernanceInexistante'
    }

    if (!gouvernance.peutSeFaireGerer(utilisateurCourant)) {
      return 'utilisateurNePeutPasAjouterComite'
    }

    gouvernance.ajouterComite(new ComiteUid(comite.state.uid.value))
    await this.#comiteRepository.add(comite)
    await this.#gouvernanceRepository.update(gouvernance)

    return 'OK'
  }
}

type Failure = 'gouvernanceInexistante' | 'utilisateurInexistant' | 'utilisateurNePeutPasAjouterComite' | ComiteFailure

type Command = Readonly<{
  commentaire?: string
  date?: string
  frequence: string
  type: string
  uidGouvernance: string
  uidUtilisateurCourant: string
}>

interface GouvernanceRepository extends FindGouvernanceRepository, UpdateGouvernanceRepository {}

type UtilisateurRepository = FindUtilisateurRepository

type ComiteRepository = AddComiteRepository
