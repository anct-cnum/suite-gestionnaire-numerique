import { describe, expect, it } from 'vitest'

import { MembreConfirme, synthetiserStructures } from './structuresMembresConfirmes'

describe('synthèse des structures membres de gouvernance', () => {
  it('une structure membre de deux gouvernances n’est comptée qu’une fois, coporteuse si elle l’est dans l’une d’elles', () => {
    // GIVEN
    const membres = [
      membre({ codeCategorieJuridique: '7210', gouvernance: '69', isCoporteur: false, structureId: 1 }),
      membre({ codeCategorieJuridique: '7210', gouvernance: '75', isCoporteur: true, structureId: 1 }),
      membre({ codeCategorieJuridique: '7346', gouvernance: '69', isCoporteur: false, structureId: 2 }),
    ]

    // WHEN
    const synthese = synthetiserStructures(membres, 'collectivite')

    // THEN
    expect(synthese).toStrictEqual({
      nombreCoporteurs: 1,
      nombreTotal: 2,
      ventilationParCategorie: [
        { categorie: 'Communes', count: 1 },
        { categorie: 'EPCI', count: 1 },
      ],
    })
  })

  it('les services de l’État ne sont comptés ni parmi les collectivités ni parmi les autres structures', () => {
    // GIVEN
    const membres = [
      membre({ codeCategorieJuridique: '7172', isCoporteur: true, structureId: 1 }),
      membre({ codeCategorieJuridique: '7220', structureId: 2 }),
      membre({ codeCategorieJuridique: '9220', isCoporteur: true, structureId: 3 }),
      membre({ codeCategorieJuridique: null, structureId: 4 }),
    ]

    // WHEN
    const collectivites = synthetiserStructures(membres, 'collectivite')
    const autresStructures = synthetiserStructures(membres, 'autreStructure')

    // THEN
    expect(collectivites).toStrictEqual({
      nombreCoporteurs: 0,
      nombreTotal: 1,
      ventilationParCategorie: [{ categorie: 'Conseils départementaux', count: 1 }],
    })
    expect(autresStructures).toStrictEqual({
      nombreCoporteurs: 1,
      nombreTotal: 2,
      ventilationParCategorie: [
        { categorie: 'Associations et fondations', count: 1 },
        { categorie: 'Autres', count: 1 },
      ],
    })
  })

  it('la ventilation est triée par nombre décroissant', () => {
    // GIVEN
    const membres = [
      membre({ codeCategorieJuridique: '7346', structureId: 1 }),
      membre({ codeCategorieJuridique: '7210', structureId: 2 }),
      membre({ codeCategorieJuridique: '7210', structureId: 3 }),
    ]

    // WHEN
    const synthese = synthetiserStructures(membres, 'collectivite')

    // THEN
    expect(synthese.ventilationParCategorie).toStrictEqual([
      { categorie: 'Communes', count: 2 },
      { categorie: 'EPCI', count: 1 },
    ])
  })
})

function membre(override: Partial<MembreConfirme>): MembreConfirme {
  return {
    codeCategorieJuridique: null,
    gouvernance: '69',
    isCoporteur: false,
    structureId: 1,
    ...override,
  }
}
