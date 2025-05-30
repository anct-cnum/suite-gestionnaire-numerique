import { LabelValue } from './labels'

export type Enveloppe = (
    | (LabelValue & Readonly<{ available: boolean; budget: number; budgetPartage: true }>)
    | (LabelValue & Readonly<{ available: boolean; budgetPartage: false }>)
  )
  