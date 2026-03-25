import { ErrorReadModel } from './shared/ErrorReadModel'

export interface DonneesStructureLoader {
  get(structureId: number, maintenant: Date): Promise<DonneesStructureReadModel | ErrorReadModel>
}

export type DonneesStructureReadModel = Readonly<{
  accompagnementsMensuels: ReadonlyArray<Readonly<{
    mois: string
    nombre: number
  }>>
  nombreLieux: number
  nombreMediateurs: number
  totalAccompagnements: number
}>