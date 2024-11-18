import { ValueObject } from './shared/Model'

export class Departement extends ValueObject<DepartementState> {
}

export type DepartementState = Readonly<{
  code: string
  codeRegion: string
  nom: string
}>
