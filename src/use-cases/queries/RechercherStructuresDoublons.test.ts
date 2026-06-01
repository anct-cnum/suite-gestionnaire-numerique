import { beforeEach, describe, expect, it } from 'vitest'

import {
  RechercherStructuresDoublons,
  SignalDoublon,
  StructuresDoublonsLoader,
  StructuresDoublonsReadModel,
} from './RechercherStructuresDoublons'

describe('rechercher les structures en doublon', () => {
  beforeEach(() => {
    spiedSignaux = null
    spiedZone = null
  })

  it('les signaux sélectionnés et la zone sont transmis au loader', async () => {
    // GIVEN
    const query = { signaux: ['nom_commune_proche'] as ReadonlyArray<SignalDoublon>, zone: zoneDepartement }
    const rechercher = new RechercherStructuresDoublons(new StructuresDoublonsLoaderSpy())

    // WHEN
    await rechercher.handle(query)

    // THEN
    expect(spiedSignaux).toStrictEqual(['nom_commune_proche'])
    expect(spiedZone).toStrictEqual(zoneDepartement)
  })

  it('aucun signal sélectionné : la détection porte sur les trois axes', async () => {
    // GIVEN
    const query = { signaux: [] as ReadonlyArray<SignalDoublon> }
    const rechercher = new RechercherStructuresDoublons(new StructuresDoublonsLoaderSpy())

    // WHEN
    await rechercher.handle(query)

    // THEN
    expect(spiedSignaux).toStrictEqual(['identifiant_externe_partage', 'nom_commune_proche', 'siret_antenne_ambigu'])
    expect(spiedZone).toBeUndefined()
  })
})

const zoneDepartement = { code: '06', type: 'departement' } as const

let spiedSignaux: null | ReadonlyArray<SignalDoublon>
let spiedZone: null | Parameters<typeof StructuresDoublonsLoaderSpy.prototype.doublons>[1]

class StructuresDoublonsLoaderSpy implements StructuresDoublonsLoader {
  async doublons(
    signaux: ReadonlyArray<SignalDoublon>,
    zone?: Parameters<StructuresDoublonsLoader['doublons']>[1]
  ): Promise<StructuresDoublonsReadModel> {
    spiedSignaux = signaux
    spiedZone = zone
    return Promise.resolve([])
  }
}
