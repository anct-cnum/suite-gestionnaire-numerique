import { describe, expect, it } from 'vitest'

import { previsualiserAdresseAction } from './previsualiserAdresseAction'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'

describe('prévisualiser une adresse action', () => {
  it('géocode la saisie et renvoie l’adresse normalisée à valider', async () => {
    // GIVEN
    vi.spyOn(ApiBanGeocodingGateway.prototype, 'geocoder').mockResolvedValueOnce({
      banClefInterop: '94017_aaaa',
      banCodeBan: null,
      banCodeInsee: '94017',
      banCodePostal: '94500',
      banLatitude: 48.81,
      banLongitude: 2.51,
      banNomCommune: 'Champigny-sur-Marne',
      banNomVoie: 'Rue Louis Talamoni',
      banNumeroVoie: 14,
      banRepetition: null,
      score: 0.96,
      type: 'housenumber',
    })

    // WHEN
    const apercu = await previsualiserAdresseAction('14 rue louis talamoni champigny')

    // THEN
    expect(apercu).toStrictEqual({ label: '14 Rue Louis Talamoni, 94500 Champigny-sur-Marne', score: 0.96 })
  })

  it('renvoie null quand la saisie est vide, sans appeler la BAN', async () => {
    // GIVEN
    const geocoder = vi.spyOn(ApiBanGeocodingGateway.prototype, 'geocoder')

    // WHEN
    const apercu = await previsualiserAdresseAction('   ')

    // THEN
    expect(apercu).toBeNull()
    expect(geocoder).not.toHaveBeenCalled()
  })

  it('renvoie null quand la BAN ne trouve aucune adresse', async () => {
    // GIVEN
    vi.spyOn(ApiBanGeocodingGateway.prototype, 'geocoder').mockResolvedValueOnce(null)

    // WHEN
    const apercu = await previsualiserAdresseAction('azertyuiop')

    // THEN
    expect(apercu).toBeNull()
  })
})
