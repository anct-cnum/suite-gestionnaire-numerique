import { Either, MaybeAsync } from 'purify-ts'

import { FindGouvernanceRepository, UpdateGouvernanceRepository } from './shared/GouvernanceRepository'
import { FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { GouvernanceUid, NoteDeContexte } from '@/domain/Gouvernance'
import { UtilisateurUid } from '@/domain/Utilisateur'

export class AjouterNoteDeContexteAGouvernance {
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

  async execute({ contenu, uid, uidGouvernance }: Command): Promise<Either<Failure, 'Ok'>> {
    return MaybeAsync
      .fromPromise(async () => this.#gouvernanceRepository.find(new GouvernanceUid(uidGouvernance)))
      .map(async (gouvernance) => {
        gouvernance.ajouterNoteDeContexte(new NoteDeContexte(this.#date, new UtilisateurUid({ email: 'eme', value: uid }), contenu))

        await this.#gouvernanceRepository.update(gouvernance)

        return 'Ok' as const
      })
      .toEitherAsync('gouvernanceInexistante')
    // const t = async (params: MaybeAsyncHelpers): Promise<'Ok'> => {
    //   const gouvernance = await params.fromPromise(this.#repository.find(new GouvernanceUid(uidGouvernance)))
    //   gouvernance.ajouterNoteDeContexte(contenu)
    //   await this.#repository.update(gouvernance)
    //   return 'Ok' as const
    // }

    // return MaybeAsync(t).toEitherAsync('gouvernanceInexistante')
  }
}

type Failure = 'gouvernanceInexistante'

type Command = Readonly<{
  contenu: string
  uid: string
  uidGouvernance: string
}>

interface GouvernanceRepository extends FindGouvernanceRepository, UpdateGouvernanceRepository {}
type UtilisateurRepository = FindUtilisateurRepository
