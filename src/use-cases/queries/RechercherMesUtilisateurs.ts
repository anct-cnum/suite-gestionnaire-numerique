import { UnUtilisateurLoader } from './RechercherUnUtilisateur'
import { QueryHandler } from '../QueryHandler'
import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'
import config from '@/use-cases/config.json'

export class RechercherMesUtilisateurs implements QueryHandler<
  MesUtilisateursQuery, UtilisateursCourantsEtTotalReadModel
> {
  readonly #loader: MesUtilisateursLoader

  constructor(mesUtilisateursLoader: MesUtilisateursLoader) {
    this.#loader = mesUtilisateursLoader
  }

  async get({
    uid,
    roles = [],
    pageCourante = 0,
    utilisateursActives = false,
    utilisateursParPage = config.utilisateursParPage,
    codeDepartement = '0',
    codeRegion = '0',
  }: MesUtilisateursQuery): Promise<UtilisateursCourantsEtTotalReadModel> {
    const utilisateur = await this.#loader.findByUid(uid)

    return this.#loader.findMesUtilisateursEtLeTotal(
      utilisateur,
      pageCourante,
      utilisateursParPage,
      utilisateursActives,
      roles,
      codeDepartement,
      codeRegion
    )
  }
}

type MesUtilisateursQuery = Readonly<{
  codeDepartement?: string
  codeRegion?: string
  pageCourante?: number
  roles?: ReadonlyArray<string>
  uid: string
  utilisateursActives?: boolean
  utilisateursParPage?: number
}>

export type UtilisateursCourantsEtTotalReadModel = Readonly<{
  total: number
  utilisateursCourants: ReadonlyArray<UnUtilisateurReadModel>
}>

export interface MesUtilisateursLoader extends UnUtilisateurLoader {
  findMesUtilisateursEtLeTotal: (
    utilisateur: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number,
    utilisateursActives: boolean,
    roles: ReadonlyArray<string>,
    codeDepartement: string,
    codeRegion: string
  ) => Promise<UtilisateursCourantsEtTotalReadModel>
}
