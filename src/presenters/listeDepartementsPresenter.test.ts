import { describe, expect, it } from 'vitest'

import { listeDepartementsPresenter } from './listeDepartementsPresenter'

describe('liste des départements presenter', () => {
  it('regroupe les départements par région, régions par ordre alphabétique et départements par code, l’outre-mer en dernier', () => {
    // GIVEN
    const readModel = [
      { codeDepartement: '974', codeRegion: '04', nomDepartement: 'La Réunion', nomRegion: 'La Réunion' },
      { codeDepartement: '75', codeRegion: '11', nomDepartement: 'Paris', nomRegion: 'Île-de-France' },
      { codeDepartement: '69', codeRegion: '84', nomDepartement: 'Rhône', nomRegion: 'Auvergne-Rhône-Alpes' },
      { codeDepartement: '971', codeRegion: '01', nomDepartement: 'Guadeloupe', nomRegion: 'Guadeloupe' },
      { codeDepartement: '01', codeRegion: '84', nomDepartement: 'Ain', nomRegion: 'Auvergne-Rhône-Alpes' },
      { codeDepartement: '2A', codeRegion: '94', nomDepartement: 'Corse-du-Sud', nomRegion: 'Corse' },
      { codeDepartement: '976', codeRegion: '06', nomDepartement: 'Mayotte', nomRegion: 'Mayotte' },
      { codeDepartement: '973', codeRegion: '03', nomDepartement: 'Guyane', nomRegion: 'Guyane' },
      { codeDepartement: '972', codeRegion: '02', nomDepartement: 'Martinique', nomRegion: 'Martinique' },
    ]

    // WHEN
    const viewModel = listeDepartementsPresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual([
      {
        departements: [
          { libelle: 'Ain (01)', lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/01' },
          { libelle: 'Rhône (69)', lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/69' },
        ],
        id: 'departements-region-84',
        titre: 'Auvergne-Rhône-Alpes',
      },
      {
        departements: [
          {
            libelle: 'Corse-du-Sud (2A)',
            lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/2A',
          },
        ],
        id: 'departements-region-94',
        titre: 'Corse',
      },
      {
        departements: [
          { libelle: 'Paris (75)', lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/75' },
        ],
        id: 'departements-region-11',
        titre: 'Île-de-France',
      },
      {
        departements: [
          {
            libelle: 'Guadeloupe (971)',
            lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/971',
          },
          {
            libelle: 'Martinique (972)',
            lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/972',
          },
          { libelle: 'Guyane (973)', lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/973' },
          {
            libelle: 'La Réunion (974)',
            lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/974',
          },
          { libelle: 'Mayotte (976)', lien: '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/976' },
        ],
        id: 'departements-outre-mer',
        titre: 'Outre-mer',
      },
    ])
  })

  it('sans département d’outre-mer, il n’y a pas de groupe « Outre-mer »', () => {
    // GIVEN
    const readModel = [
      { codeDepartement: '69', codeRegion: '84', nomDepartement: 'Rhône', nomRegion: 'Auvergne-Rhône-Alpes' },
    ]

    // WHEN
    const viewModel = listeDepartementsPresenter(readModel)

    // THEN
    expect(viewModel.map((groupe) => groupe.titre)).toStrictEqual(['Auvergne-Rhône-Alpes'])
  })
})
