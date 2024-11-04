import { ValueObject } from './shared/Model'

export class Departement extends ValueObject<DepartementState> {
  constructor(code: string, codeRegion: string, nom: string) {
    super({ code, codeRegion, nom })
  }
}

export type DepartementState = Readonly<{
  code: string
  codeRegion: string
  nom: string
}>
