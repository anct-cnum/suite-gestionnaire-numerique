import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import prisma from '../../../../prisma/prismaClient'

describe('route /api/health', () => {
  it('retourne 200 et le statut ok quand la base de données répond', async () => {
    // GIVEN
    vi.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([{ resultat: 1 }])

    // WHEN
    const result = await GET()

    // THEN
    expect(result.status).toBe(200)
    expect(result.headers.get('cache-control')).toBe('no-store')
    await expect(result.json()).resolves.toStrictEqual({ status: 'ok' })
  })

  it('retourne 503 et le statut error, sans détail interne, quand la base de données ne répond pas', async () => {
    // GIVEN
    vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('connexion refusée'))

    // WHEN
    const result = await GET()

    // THEN
    expect(result.status).toBe(503)
    expect(result.headers.get('cache-control')).toBe('no-store')
    await expect(result.json()).resolves.toStrictEqual({ status: 'error' })
  })
})
