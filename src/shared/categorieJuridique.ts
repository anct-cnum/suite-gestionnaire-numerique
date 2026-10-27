// Classement d'une structure membre de gouvernance selon le code INSEE (4 caractères)
// de sa catégorie juridique, pour les indicateurs du tableau de bord.
export function classerParCategorieJuridique(code: null | string): ClassementCategorieJuridique {
  if (code === null || code === '') {
    return autreStructure('Autres')
  }
  if (code.startsWith('71')) {
    return { famille: 'etat', libelle: 'Services de l’État' }
  }
  const collectivite = libelleDeCollectivite(code)
  if (collectivite !== undefined) {
    return { famille: 'collectivite', libelle: collectivite }
  }
  return autreStructure(libelleDAutreStructure(code))
}

export type FamilleDeStructure = 'autreStructure' | 'collectivite' | 'etat'

type ClassementCategorieJuridique = Readonly<{
  famille: FamilleDeStructure
  libelle: string
}>

const collectivites: ReadonlyMap<string, string> = new Map([
  ['7210', 'Communes'],
  ['7220', 'Conseils départementaux'],
  ['7229', 'Régions et collectivités à statut particulier'],
  ['7230', 'Régions et collectivités à statut particulier'],
  ['7343', 'EPCI'],
  ['7344', 'EPCI'],
  ['7346', 'EPCI'],
  ['7347', 'EPCI'],
  ['7348', 'EPCI'],
])

const autresStructuresParCode: ReadonlyMap<string, string> = new Map([
  ['7345', 'Syndicats'],
  ['7361', 'CCAS / CIAS'],
  ['7381', 'Chambres consulaires'],
  ['7410', 'GIP'],
])

function libelleDeCollectivite(code: string): string | undefined {
  return collectivites.get(code)
}

function libelleDAutreStructure(code: string): string {
  const libelleParCode = autresStructuresParCode.get(code)
  if (libelleParCode !== undefined) {
    return libelleParCode
  }
  if (code.startsWith('92') || code.startsWith('93')) {
    return 'Associations et fondations'
  }
  if (code.startsWith('735')) {
    return 'Syndicats'
  }
  if (code.startsWith('81')) {
    return 'Organismes de sécurité sociale'
  }
  if (code.startsWith('1') || code.startsWith('5') || code.startsWith('6')) {
    return 'Entreprises et coopératives'
  }
  if (code.startsWith('4') || code.startsWith('73')) {
    return 'Établissements publics'
  }
  return 'Autres'
}

function autreStructure(libelle: string): ClassementCategorieJuridique {
  return { famille: 'autreStructure', libelle }
}
