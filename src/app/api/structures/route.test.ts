import { NextRequest } from 'next/server'

import { GET } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { RechercherLesStructures } from '@/use-cases/queries/RechercherLesStructures'

describe('route /structures', () => {
  it('devrait retourner une erreur 403 quand on quand l’utilisateur n’est pas authentifié', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)

    const req = {
      nextUrl: {
        searchParams: new Map([['search', 'abc']]),
      },
    } as unknown as NextRequest

    // WHEN
    const result = await GET(req)

    // THEN
    expect(result.status).toBe(403)
  })

  it('devrait retourner une erreur 400 quand on quand aucune recherche n’est spécifiée', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })

    const req = {
      nextUrl: {
        searchParams: new Map(),
      },
    } as unknown as NextRequest

    // WHEN
    const result = await GET(req)

    // THEN
    expect(result.status).toBe(400)
  })

  describe('retourne la liste des structures qui correspondent à la recherche', () => {
    it.each([
      {
        desc: 'sur un nom de structure',
        expectedFindParams: { match: 'la poste' },
        searchParams: new Map([['search', 'la poste']]),
      },
      {
        desc: 'sur un nom de structure et un code de département',
        expectedFindParams: { match: 'la poste', zone: { code: '06', type: 'departement' } },
        searchParams: new Map([
          ['departement', '06'],
          ['search', 'la poste'],
        ]),
      },
      {
        desc: 'sur un nom de structure et un code de région',
        expectedFindParams: { match: 'la poste', zone: { code: '93', type: 'region' } },
        searchParams: new Map([
          ['region', '93'],
          ['search', 'la poste'],
        ]),
      },
    ])('$desc', async ({ expectedFindParams, searchParams }) => {
      // GIVEN
      vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
      const spiedFind = vi.spyOn(RechercherLesStructures.prototype, 'handle')
        .mockResolvedValueOnce([{ commune: 'TARBES', nom: 'La Poste', uid: '802' }])

      const req = {
        nextUrl: {
          searchParams,
        },
      } as unknown as NextRequest

      // WHEN
      const result = await GET(req)

      // THEN
      const response = (await result.json()) as unknown
      expect(spiedFind).toHaveBeenCalledWith(expectedFindParams)
      expect(result.status).toBe(200)
      expect(response).toStrictEqual([{ commune: 'TARBES', nom: 'La Poste', uid: '802' }])
    })
  })
})
