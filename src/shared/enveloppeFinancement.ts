/**
 * Classification métier des enveloppes de financement.
 *
 * Deux types d'enveloppes : « Conseiller Numérique » (financement des postes conum)
 * et « FNE » (France Numérique Ensemble, financement des actions des feuilles de route).
 *
 * La règle est dérivée des règles déjà présentes dans le code (préfixe de libellé,
 * équivalent au filtre SQL `libelle LIKE 'Conseiller Numérique%'`) afin d'être
 * strictement équivalente au comportement existant.
 */

export type TypeEnveloppe = 'conseiller_numerique' | 'fne'

const PREFIXE_CONSEILLER_NUMERIQUE = 'Conseiller Numérique'

export function classifierTypeEnveloppe(libelle: string): TypeEnveloppe {
  return libelle.startsWith(PREFIXE_CONSEILLER_NUMERIQUE) ? 'conseiller_numerique' : 'fne'
}

export function estEnveloppeDeFormation(libelle: string): boolean {
  return /formation/i.test(libelle)
}
