import { Filtres } from '@/domain/mesure-impact/Resultats'

// Filtres appliqués, dans l'ordre du formulaire (territoire, période, canal) : pour l'adresse de l'export et le
// nom de son fichier
export function filtresEnParametres(filtres: Filtres): ReadonlyArray<readonly [string, string]> {
  return ORDRE.flatMap((nom) => {
    const valeur = filtres[nom]
    return valeur === undefined ? [] : [[nom, valeur] as const]
  })
}

const ORDRE: ReadonlyArray<keyof Filtres> = ['codePostal', 'mois', 'canal']
