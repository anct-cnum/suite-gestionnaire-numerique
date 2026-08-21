import { rechercheTerritoiresPresenter } from '@/presenters/rechercheTerritoiresPresenter'

export function createDefaultTerritoiresTrouves(overrides?: Partial<TerritoiresTrouves>): TerritoiresTrouves {
  return {
    territoires: [
      {
        code: '70',
        nom: 'Haute-Saône',
        numeroDepartement: '70',
        type: 'departement',
      },
      {
        code: '71',
        nom: 'Saône-et-Loire',
        numeroDepartement: '71',
        type: 'departement',
      },
      {
        code: '200040590',
        nom: 'CA Villefranche Beaujolais Saône',
        numeroDepartement: '69',
        type: 'epci',
      },
      {
        code: '246900682',
        nom: 'CC Saône-Beaujolais',
        numeroDepartement: '69',
        type: 'epci',
      },
      {
        code: '200071371',
        nom: 'CC Saône Doubs Bresse',
        numeroDepartement: '71',
        type: 'epci',
      },
    ],
    total: 5,
    ...overrides,
  }
}

type TerritoiresTrouves = Parameters<typeof rechercheTerritoiresPresenter>[0]
