import { CommandHandler, ResultAsync } from '../CommandHandler'
import {
  GetUtilisateurRepository,
  UpdateDepartementUtilisateurRepository,
  UpdateStructureUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { UtilisateurFailure } from '@/domain/Utilisateur'
import { isOk } from '@/shared/lang'

export interface StructureDuDepartementLoader {
  structureDuPremierGestionnaireDepartement(
    codeDepartement: string,
    uidUtilisateurExclu: string
  ): Promise<null | number>
}

export class ChangerMonDepartement implements CommandHandler<Command> {
  readonly #structureDuDepartementLoader: StructureDuDepartementLoader
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    structureDuDepartementLoader: StructureDuDepartementLoader
  ) {
    this.#structureDuDepartementLoader = structureDuDepartementLoader
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)
    const result = utilisateurCourant.changerDepartement()
    if (isOk(result)) {
      await this.#utilisateurRepository.updateDepartement(command.uidUtilisateurCourant, command.nouveauCodeDepartement)
      // La structure suit le département : celle du premier gestionnaire du nouveau département,
      // ou null si aucune n'est identifiée (le menu retombe alors sur la page d'explication).
      const idStructure = await this.#structureDuDepartementLoader.structureDuPremierGestionnaireDepartement(
        command.nouveauCodeDepartement,
        command.uidUtilisateurCourant
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
