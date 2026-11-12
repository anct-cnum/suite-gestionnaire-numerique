import { describe, expect, it } from 'vitest'

import {
  FeuillesDeRouteLoader,
  FeuillesDeRouteReadModel,
  PoidsDocumentLoader,
  RecupererLesFeuillesDeRoute,
} from './RecupererLesFeuillesDeRoute'
import { epochTime } from '@/shared/testHelper'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('récupérer les feuilles de route', () => {
  it('le poids de chaque document est lu dans le stockage, sans lecture pour une feuille de route sans document', async () => {
    // GIVEN
    const poidsDocumentLoader = new PoidsDocumentLoaderSpy(async (chemin) =>
      Promise.resolve(chemin === 'user/1/premiere.pdf' ? 1_638_400 : 12_000)
    )

    // WHEN
    const readModel = await new RecupererLesFeuillesDeRoute(
      new FeuillesDeRouteLoaderStub(),
      poidsDocumentLoader
    ).handle({ codeDepartement: '69' })

    // THEN
    expect(spiedCodeDepartement).toBe('69')
    expect(poidsDocumentLoader.chemins).toStrictEqual(['user/1/premiere.pdf', 'user/1/seconde.pdf'])
    expect(readModel.feuillesDeRoute.map(({ pieceJointe }) => pieceJointe)).toStrictEqual([
      { chemin: 'user/1/premiere.pdf', nom: 'premiere.pdf', poids: 1_638_400, upload: epochTime },
      { chemin: 'user/1/seconde.pdf', nom: 'seconde.pdf', poids: 12_000, upload: epochTime },
      undefined,
    ])
  })

  it('quand le stockage ne répond pas, le poids reste inconnu et les feuilles de route sont quand même renvoyées', async () => {
    // GIVEN
    const poidsDocumentLoader = new PoidsDocumentLoaderSpy(async () =>
      Promise.reject(new Error('stockage injoignable'))
    )

    // WHEN
    const readModel = await new RecupererLesFeuillesDeRoute(
      new FeuillesDeRouteLoaderStub(),
      poidsDocumentLoader
    ).handle({ codeDepartement: '69' })

    // THEN
    expect(readModel.feuillesDeRoute).toHaveLength(3)
    expect(readModel.feuillesDeRoute[0].pieceJointe?.poids).toBeUndefined()
    expect(readModel.feuillesDeRoute[1].pieceJointe?.poids).toBeUndefined()
  })
})

let spiedCodeDepartement = ''

class FeuillesDeRouteLoaderStub implements FeuillesDeRouteLoader {
  async get(codeDepartement: string): Promise<FeuillesDeRouteReadModel> {
    spiedCodeDepartement = codeDepartement
    const [premiere, seconde, troisieme] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    return Promise.resolve(
      feuillesDeRouteReadModelFactory({
        feuillesDeRoute: [
          { ...premiere, pieceJointe: { chemin: 'user/1/premiere.pdf', nom: 'premiere.pdf', upload: epochTime } },
          { ...seconde, pieceJointe: { chemin: 'user/1/seconde.pdf', nom: 'seconde.pdf', upload: epochTime } },
          { ...troisieme, pieceJointe: undefined },
        ],
      })
    )
  }
}

class PoidsDocumentLoaderSpy implements PoidsDocumentLoader {
  readonly chemins: Array<string> = []
  readonly #lire: (chemin: string) => Promise<number | undefined>

  constructor(lire: (chemin: string) => Promise<number | undefined>) {
    this.#lire = lire
  }

  async lirePoids(chemin: string): Promise<number | undefined> {
    this.chemins.push(chemin)
    return this.#lire(chemin)
  }
}
