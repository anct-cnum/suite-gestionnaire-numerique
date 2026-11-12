import { describe, expect, it } from 'vitest'

import { DepartementsParRegionLoader, ListerDepartementsParRegion } from './ListerDepartementsParRegion'

describe('lister les départements par région', () => {
  it('retourne les départements du référentiel avec leur région', async () => {
    // GIVEN
    const departements = [
      { codeDepartement: '69', codeRegion: '84', nomDepartement: 'Rhône', nomRegion: 'Auvergne-Rhône-Alpes' },
    ]
    const loader: DepartementsParRegionLoader = {
      listerDepartementsParRegion: async () => Promise.resolve(departements),
    }

    // WHEN
    const readModel = await new ListerDepartementsParRegion(loader).handle()

    // THEN
    expect(readModel).toStrictEqual(departements)
  })
})
