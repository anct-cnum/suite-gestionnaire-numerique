import { formaterEnNombreFrancais } from '../shared/number'

// Date du jour à Paris, en toutes lettres : « 16 novembre 2026 »
export function dateLongue(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris', year: 'numeric' })
}

// Part arrondie à l'unité ; 0 sans base
export function pourcentage(nombre: number, base: number): number {
  return base === 0 ? 0 : Math.round((nombre * 100) / base)
}

export function pluriel(nombre: number, singulier: string, plurielDuMot: string): string {
  return `${formaterEnNombreFrancais(nombre)} ${nombre > 1 ? plurielDuMot : singulier}`
}
