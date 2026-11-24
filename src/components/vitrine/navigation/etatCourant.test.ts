import { describe, expect, it } from 'vitest'

import { cheminPublic, etatCourant } from './etatCourant'

describe('état courant de la navigation de la vitrine', () => {
  it.each([
    ['/lieux', '/lieux'],
    ['/vitrine/lieux', '/lieux'],
    ['/', '/'],
    ['/vitrine', '/'],
    ['/donnees-territoriales/gouvernances/departement/69', '/donnees-territoriales/gouvernances/departement/69'],
  ])('la page %s, arrivée avec ou sans préfixe technique, est la page courante du lien %s', (pathname, href) => {
    expect(etatCourant(pathname, href)).toBe('page')
  })

  it.each([
    ['/donnees-territoriales/gouvernances/departement/69', '/donnees-territoriales'],
    ['/vitrine/donnees-territoriales/synthese-et-indicateurs/national', '/donnees-territoriales'],
    ['/outils-numeriques/min', '/outils-numeriques'],
    ['/vitrine/outils-numeriques/min', '/outils-numeriques'],
  ])('la page %s est dans la rubrique du lien %s', (pathname, href) => {
    expect(etatCourant(pathname, href)).toBe('true')
  })

  it.each([
    ['/lieux', '/'],
    ['/vitrine/lieux', '/'],
    ['/lieux-inclusion', '/lieux'],
    ['/dispositifs', '/lieux'],
    ['/donnees-territoriales', '/donnees-territoriales/synthese-et-indicateurs/national'],
    ['/donnees-territoriales/gouvernances/departement/69', '/donnees-territoriales/gouvernances/departement/6'],
  ])('la page %s n’est pas signalée sur le lien %s', (pathname, href) => {
    expect(etatCourant(pathname, href)).toBeUndefined()
  })

  it.each([
    ['/vitrine/lieux', '/lieux'],
    ['/vitrine', '/'],
    ['/lieux', '/lieux'],
    ['/vitrines', '/vitrines'],
  ])('l’adresse publique de %s est %s', (chemin, attendu) => {
    expect(cheminPublic(chemin)).toBe(attendu)
  })
})
