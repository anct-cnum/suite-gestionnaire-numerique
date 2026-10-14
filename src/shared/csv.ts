// Encodeur commun des exports CSV.
//
// Deux protections, dans cet ordre :
// 1. neutralisation des formules : un tableur évalue une cellule qui commence par `=`, `+`, `-`,
//    `@`, une tabulation ou un retour chariot. Une valeur saisie par un utilisateur (nom, prénom,
//    fonction…) qui commence ainsi est préfixée d'une apostrophe, que le tableur interprète comme
//    « texte ». Les valeurs purement numériques (téléphones `+33…`, montants négatifs) sont
//    conservées telles quelles : sans lettre ni opérateur, elles ne peuvent pas porter de formule ;
// 2. échappement CSV : guillemets doublés et cellule entourée de guillemets si elle contient un
//    séparateur, un guillemet ou un retour à la ligne.
export function escapeCSV(value: null | number | string | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }
  const valeurTexte = neutraliserFormule(String(value))
  if (valeurTexte.includes(',') || valeurTexte.includes('"') || valeurTexte.includes('\n')) {
    return `"${valeurTexte.replace(/"/g, '""')}"`
  }
  return valeurTexte
}

function neutraliserFormule(valeur: string): string {
  if (!prefixeDeFormule.test(valeur) || valeurNumerique.test(valeur)) {
    return valeur
  }
  return `'${valeur}`
}

const prefixeDeFormule = /^[=+\-@\t\r]/
const valeurNumerique = /^[+-]?[\d\s().-]*$/
