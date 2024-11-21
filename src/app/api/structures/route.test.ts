import { NextRequest } from 'next/server'

import { GET } from './route'
import { PrismaStructureLoader } from '../../../gateways/PrismaStructureLoader'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'

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

  it('devrait retourner la liste des structures qui correspondent à la recherche', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(PrismaStructureLoader.prototype, 'findStructures').mockResolvedValueOnce([{ nom: 'La Poste', uid: '21' }])

    const req = {
      nextUrl: {
        searchParams: new Map([['search', 'abc']]),
      },
    } as unknown as NextRequest

    // WHEN
    const result = await GET(req)

    // THEN
    const response = (await result.json()) as unknown
    expect(response).toStrictEqual([{ nom: 'La Poste', uid: '21' }])
    expect(result.status).toBe(200)
  })
})
