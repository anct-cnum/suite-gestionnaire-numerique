import { QueryHandler } from '../QueryHandler'
import { UnUtilisateurLoader } from './RechercherUnUtilisateur'
import { UnUtilisateurReadModel } from './shared/UnUtilisateurReadModel'
import config from '@/use-cases/config.json'

export class RechercherMesUtilisateurs implements QueryHandler<
  Query, UtilisateursCourantsEtTotalReadModel
> {
  readonly #mesUtilisateursLoader: MesUtilisateursLoader

  constructor(mesUtilisateursLoader: MesUtilisateursLoader) {
    this.#mesUtilisateursLoader = mesUtilisateursLoader
  }

  async handle({
    uid,
    roles = [],
    pageCourante = 0,
    utilisateursActives = false,
    utilisateursParPage = config.utilisateursParPage,
    codeDepartement = '0',
    codeRegion = '0',
    idStructure = Infinity,
    prenomOuNomOuEmail,
  }: Query): Promise<UtilisateursCourantsEtTotalReadModel> {
    const utilisateur = await this.#mesUtilisateursLoader.findByUid(uid)

    return this.#mesUtilisateursLoader.mesUtilisateursEtLeTotal(
      utilisateur,
      pageCourante,
      utilisateursParPage,
      utilisateursActives,
      roles,
      codeDepartement,
      codeRegion,
      idStructure,
      prenomOuNomOuEmail
    )
  }
}

export type UtilisateursCourantsEtTotalReadModel = Readonly<{
  total: number
  utilisateursCourants: ReadonlyArray<UnUtilisateurReadModel>
}>

export interface MesUtilisateursLoader extends UnUtilisateurLoader {
  mesUtilisateursEtLeTotal(
    utilisateur: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number,
    utilisateursActives: boolean,
    roles: ReadonlyArray<string>,
    codeDepartement: string,
    codeRegion: string,
    idStructure: number,
    prenomOuNomOuEmail?: string
  ): Promise<UtilisateursCourantsEtTotalReadModel>
}

type Query = Partial<Readonly<{
  codeDepartement: string
  codeRegion: string
  pageCourante: number
  roles: ReadonlyArray<string>
  utilisateursActives: boolean
  utilisateursParPage: number
  idStructure: number
  prenomOuNomOuEmail?: string
}>> & Readonly<{
  uid: string
}>
