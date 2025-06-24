
export interface MediateursEtAidantsLoader {
  get(codeDepartement: string): Promise<MediateursEtAidantsReadModel>
}

export type MediateursEtAidantsReadModel = Readonly<{
  departement: string
  nombreAidants: number
  nombreMediateurs: number
}>

