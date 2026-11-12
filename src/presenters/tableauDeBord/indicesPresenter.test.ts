import { describe, expect, it } from 'vitest'

import {
  CLASSE_DONNEE_NON_DISPONIBLE,
  CLASSES_FRAGILITE,
  COULEUR_DONNEE_NON_DISPONIBLE,
  indiceFragiliteDepartementsPresenter,
  indiceFragilitePresenter,
  lignesTableauFragilite,
  LigneTableauFragilite,
  syntheseFragilite,
  transformerDonneesCarteFrance,
  trierLignesFragilite,
} from './indicesPresenter'

describe('indices de fragilité presenter', () => {
  it('les 7 classes ont un libellé, une tranche sans chevauchement et la couleur de la carte', () => {
    // THEN
    expect(CLASSES_FRAGILITE.map(({ libelle, tranche }) => `${tranche} : ${libelle}`)).toStrictEqual([
      '0 à 1,4 : Risque très faible',
      '1,5 à 2,8 : Risque faible',
      '2,9 à 4,2 : Risque assez faible',
      '4,3 à 5,7 : Risque moyen',
      '5,8 à 7,1 : Risque assez fort',
      '7,2 à 8,5 : Risque fort',
      '8,6 à 10 : Risque très fort',
    ])
    expect(new Set(CLASSES_FRAGILITE.map(({ couleur }) => couleur)).size).toBe(7)
    expect(CLASSES_FRAGILITE.map(({ couleur }) => couleur)).not.toContain(COULEUR_DONNEE_NON_DISPONIBLE)
  })

  it.each([
    { classe: 1, ifn: 0, indiceAffiche: '0' },
    { classe: 1, ifn: 1.4, indiceAffiche: '1,4' },
    { classe: 1, ifn: 1.449, indiceAffiche: '1,4' },
    { classe: 2, ifn: 1.45, indiceAffiche: '1,5' },
    { classe: 2, ifn: 1.5, indiceAffiche: '1,5' },
    { classe: 2, ifn: 2.8, indiceAffiche: '2,8' },
    { classe: 3, ifn: 2.9, indiceAffiche: '2,9' },
    { classe: 3, ifn: 4.2, indiceAffiche: '4,2' },
    { classe: 4, ifn: 4.3, indiceAffiche: '4,3' },
    { classe: 4, ifn: 5.7, indiceAffiche: '5,7' },
    { classe: 5, ifn: 5.8, indiceAffiche: '5,8' },
    { classe: 5, ifn: 7.08, indiceAffiche: '7,1' },
    { classe: 5, ifn: 7.1, indiceAffiche: '7,1' },
    { classe: 6, ifn: 7.2, indiceAffiche: '7,2' },
    { classe: 6, ifn: 8.5, indiceAffiche: '8,5' },
    { classe: 7, ifn: 8.6, indiceAffiche: '8,6' },
    { classe: 7, ifn: 10, indiceAffiche: '10' },
  ])(
    'la classe est calculée sur l’indice affiché : $ifn s’affiche $indiceAffiche, classe $classe',
    ({ classe, ifn, indiceAffiche }) => {
      // WHEN
      const [commune] = indiceFragilitePresenter([{ codeInsee: '69456', ifn, nom: 'Belleville-en-Beaujolais' }])

      // THEN
      expect(commune.indiceAffiche).toBe(indiceAffiche)
      expect(commune.classe.numero).toBe(classe)
      expect(commune.couleur).toBe(CLASSES_FRAGILITE[classe - 1].couleur)
    }
  )

  it('chaque borne de la légende tombe dans sa propre classe', () => {
    // GIVEN
    const bornes = CLASSES_FRAGILITE.flatMap(({ numero, tranche }) =>
      tranche.split(' à ').map((borne) => ({ ifn: Number(borne.replace(',', '.')), numero }))
    )

    // WHEN
    const communes = indiceFragilitePresenter(bornes.map(({ ifn }, index) => ({ codeInsee: String(index), ifn })))

    // THEN
    expect(communes.map(({ classe }) => classe.numero)).toStrictEqual(bornes.map(({ numero }) => numero))
  })

  it('une commune sans indice est « donnée non disponible », en gris, et non « risque très faible »', () => {
    // WHEN
    const [commune] = indiceFragilitePresenter([{ codeInsee: '75056', ifn: null, nom: 'Paris' }])

    // THEN
    expect(commune).toStrictEqual({
      classe: CLASSE_DONNEE_NON_DISPONIBLE,
      codeInsee: '75056',
      couleur: COULEUR_DONNEE_NON_DISPONIBLE,
      indice: null,
      indiceAffiche: 'non disponible',
      nom: 'Paris',
      nomConnu: true,
    })
  })

  it('une commune dont le nom est inconnu est désignée par son code INSEE', () => {
    // WHEN
    const [commune] = indiceFragilitePresenter([{ codeInsee: '69152', ifn: 3.25 }])

    // THEN
    expect(commune.nom).toBe('69152')
    expect(commune.nomConnu).toBe(false)
  })

  it('un département porte sa classe, son indice arrondi et, sans indice, la donnée non disponible', () => {
    // WHEN
    const departements = indiceFragiliteDepartementsPresenter([
      { codeDepartement: '69', ifn: 4.731_852, nom: 'Rhône' },
      { codeDepartement: '75', ifn: null },
    ])

    // THEN
    expect(departements).toStrictEqual([
      {
        classe: CLASSES_FRAGILITE[3],
        codeDepartement: '69',
        couleur: CLASSES_FRAGILITE[3].couleur,
        indiceAffiche: '4,7',
        nom: 'Rhône',
        nomConnu: true,
        score: 4.7,
      },
      {
        classe: CLASSE_DONNEE_NON_DISPONIBLE,
        codeDepartement: '75',
        couleur: COULEUR_DONNEE_NON_DISPONIBLE,
        indiceAffiche: 'non disponible',
        nom: '75',
        nomConnu: false,
        score: null,
      },
    ])
  })

  it('l’infobulle de la carte de France affiche l’indice arrondi, ou qu’il n’est pas disponible', () => {
    // GIVEN
    const departements = indiceFragiliteDepartementsPresenter([
      { codeDepartement: '69', ifn: 4.731_852, nom: 'Rhône' },
      { codeDepartement: '75', ifn: null, nom: 'Paris' },
    ])

    // WHEN
    const donnees = transformerDonneesCarteFrance(departements)

    // THEN
    expect(donnees).toStrictEqual([
      { codeDepartement: '69', couleur: CLASSES_FRAGILITE[3].couleur, popup: '4,7/10' },
      { codeDepartement: '75', couleur: COULEUR_DONNEE_NON_DISPONIBLE, popup: 'Indice non disponible' },
    ])
  })

  it('les lignes du tableau des départements affichent le nom suivi du code, triées par nom', () => {
    // GIVEN
    const departements = indiceFragiliteDepartementsPresenter([
      { codeDepartement: '69', ifn: 4.7, nom: 'Rhône' },
      { codeDepartement: '01', ifn: 4.8, nom: 'Ain' },
    ])

    // WHEN
    const lignes = lignesTableauFragilite(departements)

    // THEN
    expect(lignes.map(({ territoire }) => territoire)).toStrictEqual(['Ain (01)', 'Rhône (69)'])
  })

  it('les communes sans nom (codes INSEE disparus) viennent en fin du tri alphabétique, dans les deux sens', () => {
    // GIVEN
    const lignes = lignesTableauFragilite(
      indiceFragilitePresenter([
        { codeInsee: '69159', ifn: 2 },
        { codeInsee: '69152', ifn: 3 },
        { codeInsee: '69456', ifn: 7, nom: 'Belleville-en-Beaujolais' },
        { codeInsee: '69001', ifn: 5, nom: 'Affoux' },
      ])
    )

    // WHEN
    const decroissant = trierLignesFragilite(lignes, { colonne: 'territoire', sens: 'descending' })

    // THEN
    expect(territoires(lignes)).toStrictEqual(['Affoux', 'Belleville-en-Beaujolais', '69152', '69159'])
    expect(territoires(decroissant)).toStrictEqual(['Belleville-en-Beaujolais', 'Affoux', '69152', '69159'])
  })

  it('les indices non disponibles viennent en fin du tri par indice, dans les deux sens', () => {
    // GIVEN
    const lignes = lignesTableauFragilite(
      indiceFragilitePresenter([
        { codeInsee: '75056', ifn: null, nom: 'Paris' },
        { codeInsee: '69001', ifn: 5, nom: 'Affoux' },
        { codeInsee: '69123', ifn: null, nom: 'Lyon' },
        { codeInsee: '69456', ifn: 7, nom: 'Belleville-en-Beaujolais' },
        { codeInsee: '69002', ifn: 5, nom: 'Aigueperse' },
      ])
    )

    // WHEN
    const croissant = trierLignesFragilite(lignes, { colonne: 'indice', sens: 'ascending' })
    const decroissant = trierLignesFragilite(lignes, { colonne: 'indice', sens: 'descending' })

    // THEN
    expect(territoires(croissant)).toStrictEqual(['Affoux', 'Aigueperse', 'Belleville-en-Beaujolais', 'Lyon', 'Paris'])
    expect(territoires(decroissant)).toStrictEqual([
      'Belleville-en-Beaujolais',
      'Affoux',
      'Aigueperse',
      'Lyon',
      'Paris',
    ])
  })

  it('la synthèse compte les territoires par classe, puis ceux sans donnée', () => {
    // GIVEN
    const lignes = lignesTableauFragilite(
      indiceFragilitePresenter([
        { codeInsee: '69001', ifn: 1, nom: 'Affoux' },
        { codeInsee: '69002', ifn: 1.2, nom: 'Aigueperse' },
        { codeInsee: '69456', ifn: 9, nom: 'Belleville-en-Beaujolais' },
        { codeInsee: '69123', ifn: null, nom: 'Lyon' },
      ])
    )

    // WHEN
    const synthese = syntheseFragilite(lignes, { pluriel: 'communes', singulier: 'commune' })

    // THEN
    expect(synthese).toBe('4 communes : 2 en risque très faible, 1 en risque très fort, 1 sans donnée disponible.')
  })

  it('la synthèse d’un seul territoire est au singulier, et celle d’aucun territoire n’a pas de détail', () => {
    // GIVEN
    const lignes = lignesTableauFragilite(indiceFragilitePresenter([{ codeInsee: '69001', ifn: 4.5, nom: 'Affoux' }]))

    // WHEN
    const synthese = syntheseFragilite(lignes, { pluriel: 'communes', singulier: 'commune' })
    const syntheseVide = syntheseFragilite([], { pluriel: 'communes', singulier: 'commune' })

    // THEN
    expect(synthese).toBe('1 commune : 1 en risque moyen.')
    expect(syntheseVide).toBe('0 commune.')
  })
})

function territoires(lignes: ReadonlyArray<LigneTableauFragilite>): ReadonlyArray<string> {
  return lignes.map(({ territoire }) => territoire)
}
