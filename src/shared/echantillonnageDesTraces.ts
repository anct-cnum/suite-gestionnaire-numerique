// Part des pages dont Sentry mesure la performance, selon le nom de la page (son chemin, parfois paramétré).
// Aucune trace sur le questionnaire de mesure d'impact : pas de traceur non essentiel pour les personnes qui y
// répondent (ticket #2263, RG3). Les erreurs, elles, restent remontées.
export function tauxDeTraces(nomDeLaPage: string): number {
  return nomDeLaPage.startsWith('/questionnaire/') ? 0 : 1
}
