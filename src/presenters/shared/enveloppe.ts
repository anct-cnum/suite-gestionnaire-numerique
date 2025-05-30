import { LabelValue } from './labels'

export type Enveloppe = (
    | (LabelValue & Readonly<{ available: boolean; budget: number; limiteLaDemandeSubvention: true }>)
    | (LabelValue & Readonly<{ available: boolean; limiteLaDemandeSubvention: false }>)
  )
  