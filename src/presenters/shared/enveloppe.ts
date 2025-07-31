import { LabelValue } from './labels'

export type Enveloppe = (
    | (LabelValue & Readonly<{ available: boolean; budget: number; limiteLaDemandeSubvention: true }>)
    | (LabelValue & Readonly<{ available: boolean; limiteLaDemandeSubvention: false }>)
  )

export const couleursEnveloppes = {
  'Conseiller Numérique - 2021 - État': 'dot-purple-glycine-main-494',
  'Conseiller Numérique - Plan France Relance - État': 'dot-purple-glycine-850-200',
  'Formation Aidant Numérique/Aidants Connect - 2024 - État': 'dot-green-tilleul-verveine-925',
  'Ingénierie France Numérique Ensemble - 2024 - État': 'dot-orange-terre-battue-850-200',
} as const

export const couleursGraphiqueEnveloppes = {
  'dot-green-tilleul-verveine-925': '#FFE800',
  'dot-grey-925-125': '#666666',
  'dot-orange-terre-battue-850-200': '#fcc0b0',
  'dot-purple-glycine-850-200': '#fbb8f6',
  'dot-purple-glycine-main-494': '#a558a0',
} as const

export function obtenirCouleurEnveloppe(label: string): string {
  return label in couleursEnveloppes 
    ? couleursEnveloppes[label as keyof typeof couleursEnveloppes] 
    : 'dot-grey-925-125'
}

export function obtenirCouleurGraphique(couleurDot: string): string {
  return couleurDot in couleursGraphiqueEnveloppes
    ? couleursGraphiqueEnveloppes[couleurDot as keyof typeof couleursGraphiqueEnveloppes]
    : '#666666'
}
  