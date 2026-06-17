import { describe, expect, it } from 'vitest'

import { parserCsvMembresAConsolider } from './membresAConsoliderPresenter'

describe('parser CSV des membres à consolider', () => {
  it('parse les lignes valides (séparateur tabulation, en-têtes #1573)', () => {
    // GIVEN
    const csv = [
      'membre_id\tmembre_nom\tcur_id\talt_id',
      'structure-26800067600331-80\tCCAS Amiens\t6220\t6221',
      'epci-200070126-10\tCC Seine et Aube\t1506\t1505',
    ].join('\n')

    // WHEN
    const resultat = parserCsvMembresAConsolider(csv)

    // THEN
    expect(resultat.erreurs).toStrictEqual([])
    expect(resultat.lignes).toStrictEqual([
      {
        idCible: 6221,
        idMembre: 'structure-26800067600331-80',
        idSource: 6220,
        nomActuel: 'Structure #6220',
        nomOrigine: 'CCAS Amiens',
      },
      {
        idCible: 1505,
        idMembre: 'epci-200070126-10',
        idSource: 1506,
        nomActuel: 'Structure #1506',
        nomOrigine: 'CC Seine et Aube',
      },
    ])
  })

  it('supporte le point-virgule et se rabat sur membre_id quand membre_nom est absent', () => {
    // WHEN
    const resultat = parserCsvMembresAConsolider('membre_id;cur_id;alt_id\nstructure-1-26;10;20')

    // THEN
    expect(resultat.lignes).toStrictEqual([
      {
        idCible: 20,
        idMembre: 'structure-1-26',
        idSource: 10,
        nomActuel: 'Structure #10',
        nomOrigine: 'structure-1-26',
      },
    ])
  })

  it('signale et ignore les lignes aux identifiants invalides', () => {
    // GIVEN
    const csv = 'membre_id,cur_id,alt_id\nstructure-1-26,10,20\n,30,40\nstructure-2-26,abc,50'

    // WHEN
    const resultat = parserCsvMembresAConsolider(csv)

    // THEN
    expect(resultat.lignes).toHaveLength(1)
    expect(resultat.lignes[0].idMembre).toBe('structure-1-26')
    expect(resultat.erreurs).toStrictEqual([
      'Ligne 3 ignorée : membre_id / cur_id / alt_id invalides.',
      'Ligne 4 ignorée : membre_id / cur_id / alt_id invalides.',
    ])
  })

  it('renvoie une erreur quand les en-têtes requis manquent', () => {
    // WHEN
    const resultat = parserCsvMembresAConsolider('membre_id,source,cible\nstructure-1-26,10,20')

    // THEN
    expect(resultat.lignes).toStrictEqual([])
    expect(resultat.erreurs).toStrictEqual(['En-têtes requis manquants : membre_id, cur_id, alt_id.'])
  })

  it('renvoie une erreur quand il n’y a pas de ligne de données', () => {
    // WHEN
    const resultat = parserCsvMembresAConsolider('membre_id,cur_id,alt_id')

    // THEN
    expect(resultat.erreurs).toStrictEqual(['Collez au moins une ligne d’en-tête et une ligne de données.'])
  })
})
