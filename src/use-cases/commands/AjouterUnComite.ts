import { CommandHandler, ResultAsync } from '../CommandHandler'
import { AddComiteRepository } from './shared/ComiteRepository'
import { GetGouvernanceRepository } from './shared/GouvernanceRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { Comite, ComiteFailure } from '@/domain/Comite'
import { GouvernanceUid } from '@/domain/Gouvernance'

export class AjouterUnComite implements CommandHandler<Command> {
  readonly #comiteRepository: ComiteRepository
  readonly #date: Date
  readonly #gouvernanceRepository: GouvernanceRepository
  readonly #utilisateurRepository: UtilisateurRepository

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

  async handle(command: Command): ResultAsync<Failure> {
    const editeur = await this.#utilisateurRepository.get(command.uidEditeur)
    const gouvernance = await this.#gouvernanceRepository.get(new GouvernanceUid(command.uidGouvernance))
    const dateDeCreation = this.#date
    const comite = Comite.create({
      commentaire: command.commentaire,
      date: command.date === undefined ? undefined : new Date(command.date),
      dateDeCreation,
      dateDeModification: dateDeCreation,
      frequence: command.frequence,
      type: command.type,
      uid: {
        value: 'identifiantPourLaCreation',
      },
      uidEditeur: editeur.state.uid,
      uidGouvernance: gouvernance.state.uid,
    })
    if (!(comite instanceof Comite)) {
      return comite
    }

    if (!gouvernance.peutEtreGereePar(editeur)) {
      return 'editeurNePeutPasAjouterComite'
    }

    await this.#comiteRepository.add(comite)

    return 'OK'
  }
}

type Failure = 'editeurNePeutPasAjouterComite' | ComiteFailure

type Command = Readonly<{
  commentaire?: string
  date?: string
  frequence: string
  type: string
  uidEditeur: string
  uidGouvernance: string
}>

type GouvernanceRepository = GetGouvernanceRepository

type UtilisateurRepository = GetUtilisateurRepository

type ComiteRepository = AddComiteRepository
