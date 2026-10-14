import { describe, expect, it } from 'vitest'

import { escapeCSV } from './csv'

describe('encodeur CSV des exports', () => {
  it.each([
    { attendu: '', intention: 'renvoie une cellule vide pour null', valeur: null },
    { attendu: '', intention: 'renvoie une cellule vide pour undefined', valeur: undefined },
    { attendu: 'Tartempion', intention: 'laisse un texte ordinaire tel quel', valeur: 'Tartempion' },
    { attendu: '42', intention: 'convertit un nombre en texte', valeur: 42 },
    {
      attendu: '"Dupont, Jean"',
      intention: 'entoure de guillemets une valeur contenant un séparateur',
      valeur: 'Dupont, Jean',
    },
    { attendu: '"Dit ""Jojo"""', intention: 'double les guillemets et entoure la valeur', valeur: 'Dit "Jojo"' },
    {
      attendu: '"ligne 1\nligne 2"',
      intention: 'entoure de guillemets une valeur multiligne',
      valeur: 'ligne 1\nligne 2',
    },
  ])('$intention', ({ attendu, valeur }) => {
    // WHEN
    const cellule = escapeCSV(valeur)

    // THEN
    expect(cellule).toBe(attendu)
  })

  it.each([
    { attendu: "'=1+1", intention: 'neutralise une formule commençant par =', valeur: '=1+1' },
    { attendu: "'+cmd|calc", intention: 'neutralise une formule commençant par +', valeur: '+cmd|calc' },
    { attendu: "'-2+3+cmd", intention: 'neutralise une formule commençant par -', valeur: '-2+3+cmd' },
    { attendu: "'@SUM(1)", intention: 'neutralise une formule commençant par @', valeur: '@SUM(1)' },
    { attendu: "'\tSUM(1)", intention: 'neutralise une valeur commençant par une tabulation', valeur: '\tSUM(1)' },
    { attendu: "'\rSUM(1)", intention: 'neutralise une valeur commençant par un retour chariot', valeur: '\rSUM(1)' },
    {
      attendu: '"\'=HYPERLINK(""http://x"", ""clic"")"',
      intention: 'neutralise la formule avant l’échappement des guillemets et séparateurs',
      valeur: '=HYPERLINK("http://x", "clic")',
    },
  ])('$intention', ({ attendu, valeur }) => {
    // WHEN
    const cellule = escapeCSV(valeur)

    // THEN
    expect(cellule).toBe(attendu)
  })

  it.each([
    { attendu: '+33102030405', intention: 'conserve un téléphone international', valeur: '+33102030405' },
    {
      attendu: '+33 (0)1 02 03 04 05',
      intention: 'conserve un téléphone avec espaces et parenthèses',
      valeur: '+33 (0)1 02 03 04 05',
    },
    { attendu: '-5', intention: 'conserve un nombre négatif', valeur: '-5' },
    { attendu: '-1 234.5', intention: 'conserve un montant négatif décimal', valeur: '-1 234.5' },
    { attendu: '-', intention: 'conserve un tiret seul', valeur: '-' },
  ])('$intention', ({ attendu, valeur }) => {
    // WHEN
    const cellule = escapeCSV(valeur)

    // THEN
    expect(cellule).toBe(attendu)
  })
})
