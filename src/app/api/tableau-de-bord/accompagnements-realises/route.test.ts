import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import * as fetchAccompagnementsRealisesModule from '@/use-cases/queries/fetchAccompagnementsRealises'

describe('route /api/tableau-de-bord/accompagnements-realises', () => {
  it("retourne une erreur 403 quand l'utilisateur n'est pas authentifié", async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)
    const req = { nextUrl: { searchParams: new URLSearchParams() } } as unknown as NextRequest

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
    const searchParams = new URLSearchParams('territoire=06')
    const req = { nextUrl: { searchParams } } as unknown as NextRequest

    // WHEN
    const result = await GET(req)

    // THEN
    expect(spy).toHaveBeenCalledWith('06')
    expect(result.status).toBe(200)
    await expect(result.json()).resolves.toStrictEqual(resultat)
  })

  it("utilise France par défaut quand le territoire n'est pas précisé", async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    const spy = vi
      .spyOn(fetchAccompagnementsRealisesModule, 'fetchAccompagnementsRealises')
      .mockResolvedValueOnce({ nombreTotal: 0, repartitionMensuelle: [] })
    const req = { nextUrl: { searchParams: new URLSearchParams() } } as unknown as NextRequest

    // WHEN
    await GET(req)

    // THEN
    expect(spy).toHaveBeenCalledWith('France')
  })
})
