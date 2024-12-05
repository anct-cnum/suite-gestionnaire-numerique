import { Either, Left, Maybe, Right } from 'purify-ts'

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
    // VERSION ENTIÈREMENT CHAÎNÉE
    // return MaybeAsync.liftMaybe(Maybe.fromNullable(await this.#utilisateurRepository.find(uid)))
    //   .toEitherAsync('utilisateurInexistant' as const)
    //   .chain(utilisateurCourant => MaybeAsync
    //     .fromPromise(async () => this.#gouvernanceRepository.find(new GouvernanceUid(uidGouvernance)))
    //     .map(async (gouvernance) => {
    //       gouvernance.ajouterNoteDeContexte(
    //         new NoteDeContexte(this.#date, new UtilisateurUid(utilisateurCourant!.state.uid), contenu)
    //       )
    //       await this.#gouvernanceRepository.update(gouvernance)
    //       return 'Ok' as const
    //     })
    //     .toEitherAsync('gouvernanceInexistante' as const)
    //   )

    // VERSION IMPÉRATIVE MAIS AVEC CALLBACK
    // return EitherAsync(async (helpers) => {
    //   const maybeUtilisateurCourant = Maybe.fromNullable(await this.#utilisateurRepository.find(uid))
    //   const utilisateurCourant = await helpers.liftEither(maybeUtilisateurCourant.toEither('utilisateurInexistant'))
    //   const maybeGouvernance = (await this.#gouvernanceRepository.find(new GouvernanceUid(uidGouvernance)))
    //   const gouvernance = await helpers.liftEither(maybeGouvernance.toEither('gouvernanceInexistante' as const))
    //   gouvernance.ajouterNoteDeContexte(
    //     new NoteDeContexte(this.#date, new UtilisateurUid(utilisateurCourant.state.uid), contenu)
    //   )
    //   await this.#gouvernanceRepository.update(gouvernance)
    //   return 'Ok' as const
    // })

    // VERSION FULL À LA ZOB (COMME AVEC LES RESULT)
    const maybeUtilisateurCourant = Maybe.fromNullable(await this.#utilisateurRepository.find(uid))
    if (maybeUtilisateurCourant.isNothing()) {
      return Left('utilisateurInexistant')
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const utilisateurCourant = maybeUtilisateurCourant.extract()!
    const maybeGouvernance = await this.#gouvernanceRepository.find(new GouvernanceUid(uidGouvernance))
    if (maybeGouvernance.isNothing()) {
      return Left('gouvernanceInexistante')
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const gouvernance = maybeGouvernance.extract()!
    gouvernance.ajouterNoteDeContexte(
      new NoteDeContexte(this.#date, new UtilisateurUid(utilisateurCourant.state.uid), contenu)
    )
    await this.#gouvernanceRepository.update(gouvernance)
    return Right('Ok')
  }
}

type Failure = 'gouvernanceInexistante' | 'utilisateurInexistant'

type Command = Readonly<{
  contenu: string
  uid: string
  uidGouvernance: string
}>

interface GouvernanceRepository extends FindGouvernanceRepository, UpdateGouvernanceRepository {}
type UtilisateurRepository = FindUtilisateurRepository
