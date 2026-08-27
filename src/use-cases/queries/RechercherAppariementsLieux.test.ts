import { describe, expect, it } from 'vitest'

import {
  AppariementsLieuxLoader,
  AppariementsLieuxReadModel,
  RechercherAppariementsLieux,
} from './RechercherAppariementsLieux'

describe('rechercher les appariements de lieux', () => {
  it('transmet le statut et la pagination au loader et renvoie son résultat', async () => {
    // GIVEN
    const query = { pagination: { limite: 10, page: 2 }, statut: 'valide' as const }
    const loader = new AppariementsLieuxLoaderSpy()

    // WHEN
    const readModel = await new RechercherAppariementsLieux(loader).handle(query)

    // THEN
    expect(loader.spiedQuery).toStrictEqual(query)
    expect(readModel).toStrictEqual(readModelVide)
  })
})

const readModelVide: AppariementsLieuxReadModel = {
  appariements: [],
  compteurs: { a_valider: 0, rejete: 0, valide: 0 },
  total: 0,
}

class AppariementsLieuxLoaderSpy implements AppariementsLieuxLoader {
  spiedQuery: null | Parameters<AppariementsLieuxLoader['rechercher']>[0] = null

  async rechercher(query: Parameters<AppariementsLieuxLoader['rechercher']>[0]): Promise<AppariementsLieuxReadModel> {
    this.spiedQuery = query
    return Promise.resolve(readModelVide)
  }
}
