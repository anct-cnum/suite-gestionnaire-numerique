import { CommandHandler, ResultAsync } from '../CommandHandler'
import { StructurePrefectureDuDepartementLoader } from './InviterUnUtilisateur'
import {
  GetUtilisateurRepository,
  UpdateDepartementUtilisateurRepository,
  UpdateStructureUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { UtilisateurFailure } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export class ChangerMonDepartement implements CommandHandler<Command> {
  readonly #structurePrefectureDuDepartementLoader: StructurePrefectureDuDepartementLoader
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    structurePrefectureDuDepartementLoader: StructurePrefectureDuDepartementLoader
  ) {
    this.#structurePrefectureDuDepartementLoader = structurePrefectureDuDepartementLoader
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)
    const result = utilisateurCourant.changerDepartement()
    if (isOk(result)) {
      await this.#utilisateurRepository.updateDepartement(command.uidUtilisateurCourant, command.nouveauCodeDepartement)
      // La structure suit le département : la préfecture départementale (même règle qu'à
      // l'invitation), ou null si aucune n'est identifiée (le menu retombe alors sur la
      // page d'explication).
      const idStructure = await this.#structurePrefectureDuDepartementLoader.structurePrefectureDuDepartement(
        command.nouveauCodeDepartement
      )
      await this.#utilisateurRepository.updateStructure(command.uidUtilisateurCourant, idStructure)
    }

    return result
  }
}

type Failure = UtilisateurFailure

type Command = Readonly<{
  nouveauCodeDepartement: string
  uidUtilisateurCourant: string
}>

interface UtilisateurRepository
  extends GetUtilisateurRepository, UpdateDepartementUtilisateurRepository, UpdateStructureUtilisateurRepository {}
