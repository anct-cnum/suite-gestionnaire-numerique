import { formaterEnNombreFrancais } from '../shared/number'

// Date du jour à Paris, en toutes lettres : « 16 novembre 2026 »
export function dateLongue(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris', year: 'numeric' })
}

export function pluriel(nombre: number, singulier: string, plurielDuMot: string): string {
  return `${formaterEnNombreFrancais(nombre)} ${nombre > 1 ? plurielDuMot : singulier}`
}
