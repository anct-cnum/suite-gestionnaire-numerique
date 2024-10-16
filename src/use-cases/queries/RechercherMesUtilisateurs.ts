import { UnUtilisateurLoader } from './RechercherUnUtilisateur'
import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'
import { QueryHandler } from '../QueryHandler'

export class RechercherMesUtilisateurs implements QueryHandler<
  MesUtilisateursQuery, UtilisateursCourantsEtTotalReadModel
> {
  readonly #loader: MesUtilisateursLoader

  constructor(mesUtilisateursLoader: MesUtilisateursLoader) {
    this.#loader = mesUtilisateursLoader
  }

  async get({
    ssoId,
    pageCourante,
    utilisateursActives,
    utilisateursParPage,
  }: MesUtilisateursQuery): Promise<UtilisateursCourantsEtTotalReadModel> {
    const utilisateur = await this.#loader.findBySsoId(ssoId)

    return this.#loader.findMesUtilisateursEtLeTotal(
      utilisateur,
      pageCourante,
      utilisateursParPage,
      utilisateursActives
    )
  }
}

type MesUtilisateursQuery = Readonly<{
  pageCourante: number
  ssoId: string
  utilisateursActives: boolean
  utilisateursParPage: number
}>

export type UtilisateursCourantsEtTotalReadModel = Readonly<{
  utilisateursCourants: ReadonlyArray<UnUtilisateurReadModel>
  total: number
}>

export interface MesUtilisateursLoader extends UnUtilisateurLoader {
  findMesUtilisateursEtLeTotal: (
    utilisateur: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number,
    utilisateursActives: boolean
  ) => Promise<UtilisateursCourantsEtTotalReadModel>
}
