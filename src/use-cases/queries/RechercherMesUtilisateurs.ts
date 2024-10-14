import { UnUtilisateurLoader, UnUtilisateurReadModel } from './RechercherUnUtilisateur'
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

export type MesUtilisateursReadModel = Readonly<{
  departementCode: string | null
  derniereConnexion: Date
  groupementId: number | null
  email: string
  inviteLe: Date
  isActive: boolean
  isSuperAdmin: boolean
  nom: string
  prenom: string
  regionCode: string | null
  role: Readonly<{
    categorie: string
    groupe: string
    nom: string
    territoireOuStructure: string
  }>
  structureId: number | null
  telephone: string
  uid: string
}>

export type UtilisateursCourantsEtTotalReadModel = Readonly<{
  utilisateursCourants: ReadonlyArray<MesUtilisateursReadModel>
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
