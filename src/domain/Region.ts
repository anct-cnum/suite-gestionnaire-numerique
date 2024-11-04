import { ValueObject } from './shared/Model'

export class Region extends ValueObject<RegionState> {
  constructor(code: string, nom: string) {
    super({ code, nom })
  }
}

export type RegionState = Readonly<{
  code: string
  nom: string
}>
