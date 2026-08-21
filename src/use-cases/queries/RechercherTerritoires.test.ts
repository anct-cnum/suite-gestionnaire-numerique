import { describe, expect, it } from 'vitest'

import {
  PerimetreRechercheTerritoires,
  RechercherTerritoires,
  RechercheTerritoiresLoader,
  TerritoiresTrouvesReadModel,
} from './RechercherTerritoires'

describe('rechercher les territoires', () => {
  it('recherche de territoires par correspondance du nom : le terme, la limite de 5 résultats et le périmètre sont transmis', async () => {
    // GIVEN
    const rechercherTerritoires = new RechercherTerritoires(new RechercheTerritoiresLoaderSpy())

    // WHEN
    const readModel = await rechercherTerritoires.handle({
      perimetre: { codesDepartement: ['69'], type: 'departements' },
      terme: 'saône',
    })

    // THEN
    expect(spiedArgs).toStrictEqual(['saône', 5, { codesDepartement: ['69'], type: 'departements' }])
    expect(readModel).toStrictEqual<TerritoiresTrouvesReadModel>({
      territoires: [
        {
          code: '70',
          nom: 'Haute-Saône',
          numeroDepartement: '70',
          type: 'departement',
        },
      ],
      total: 1,
    })
  })
})

let spiedArgs: null | Parameters<typeof RechercheTerritoiresLoaderSpy.prototype.rechercher> = null

class RechercheTerritoiresLoaderSpy implements RechercheTerritoiresLoader {
  async rechercher(
    terme: string,
    limite: number,
    perimetre: PerimetreRechercheTerritoires
  ): Promise<TerritoiresTrouvesReadModel> {
    spiedArgs = [terme, limite, perimetre]
    return Promise.resolve({
      territoires: [
        {
          code: '70',
          nom: 'Haute-Saône',
          numeroDepartement: '70',
          type: 'departement',
        },
      ],
      total: 1,
    })
  }
}
