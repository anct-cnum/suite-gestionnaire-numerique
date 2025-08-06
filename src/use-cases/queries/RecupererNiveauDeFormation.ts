export type NiveauDeFormationReadModel = Readonly<{
  aidantsEtMediateursFormes: number
  formations: Array<{
    nom: string
    nombre: number
  }>
  totalAidantsEtMediateurs: number
}>

export interface NiveauDeFormationLoader {
  get(territoire?: string): NiveauDeFormationReadModel
}
