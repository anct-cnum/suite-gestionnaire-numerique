import { ValueObject } from './shared/Model'

export class Region extends ValueObject<RegionState> {
}

export type RegionState = Readonly<{
  code: string
  nom: string
}>
