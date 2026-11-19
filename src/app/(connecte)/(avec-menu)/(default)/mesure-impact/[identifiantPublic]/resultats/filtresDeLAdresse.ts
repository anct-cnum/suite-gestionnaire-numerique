import { Canal } from '@/domain/mesure-impact/Questionnaire'
import { Filtres } from '@/domain/mesure-impact/Resultats'

// Filtres des résultats lus dans l'adresse, pour la page et pour l'export. Un filtre vide ou mal formé est
// ignoré : les résultats portent alors sur toute la campagne.
export function filtresDeLAdresse({ canal, codePostal, mois }: ParametresDeRecherche): Filtres {
  return {
    ...(CANAUX.some((candidat) => candidat === canal) ? { canal: canal as Canal } : {}),
    ...(typeof codePostal === 'string' && /^\d{5}$/.test(codePostal) ? { codePostal } : {}),
    ...(typeof mois === 'string' && /^\d{4}-\d{2}$/.test(mois) ? { mois } : {}),
  }
}

export type ParametresDeRecherche = Readonly<
  Partial<Record<'canal' | 'codePostal' | 'mois', ReadonlyArray<string> | string>>
>

const CANAUX: ReadonlyArray<Canal> = ['en-ligne', 'papier', 'telephone']
