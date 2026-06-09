import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import * as fetchAccompagnementsRealisesModule from '@/use-cases/queries/fetchAccompagnementsRealises'

describe('route /api/tableau-de-bord/accompagnements-realises', () => {
  it('retourne une erreur 403 quand l’utilisateur n’est pas authentifié', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)
    const req = { nextUrl: { searchParams: new Map() } } as unknown as NextRequest

    // WHEN
    const result = await GET(req)

    // THEN
    expect(result.status).toBe(403)
  })

  it('retourne les accompagnements du territoire demandé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    const resultat = { nombreTotal: 42, repartitionMensuelle: [{ mois: 'Jan.', nombre: 7 }] }
    const spy = vi
      .spyOn(fetchAccompagnementsRealisesModule, 'fetchAccompagnementsRealises')
      .mockResolvedValueOnce(resultat)
    const req = { nextUrl: { searchParams: new Map([['territoire', '06']]) } } as unknown as NextRequest

    // WHEN
    const result = await GET(req)

    // THEN
    expect(spy).toHaveBeenCalledWith('06')
    expect(result.status).toBe(200)
    expect(await result.json()).toStrictEqual(resultat)
  })

  it('utilise France par défaut quand le territoire n’est pas précisé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    const spy = vi
      .spyOn(fetchAccompagnementsRealisesModule, 'fetchAccompagnementsRealises')
      .mockResolvedValueOnce({ nombreTotal: 0, repartitionMensuelle: [] })
    const req = { nextUrl: { searchParams: new Map() } } as unknown as NextRequest

    // WHEN
    await GET(req)

    // THEN
    expect(spy).toHaveBeenCalledWith('France')
  })
})
