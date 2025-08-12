import { ErrorReadModel } from './shared/ErrorReadModel'

export type NiveauDeFormationReadModel = Readonly<{
  aidantsEtMediateursFormes: number
  formations: Array<{
    nom: string
    nombre: number
  }>
  totalAidantsEtMediateurs: number
}>

export interface NiveauDeFormationLoader {
  get(territoire?: string): Promise<NiveauDeFormationReadModel | ErrorReadModel>
}
