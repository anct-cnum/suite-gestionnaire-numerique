import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import * as perimetreModule from '@/use-cases/queries/PerimetreRechercheTerritoire'
import { RechercherTerritoires } from '@/use-cases/queries/RechercherTerritoires'
import * as resoudreContexteModule from '@/use-cases/queries/ResoudreContexte'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

describe('route /api/tableau-de-bord/territoires', () => {
  it("retourne une erreur 403 quand l'utilisateur n'est pas authentifié", async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)
    const req = requete('saône')

    // WHEN
    const result = await GET(req)

    // THEN
    expect(result.status).toBe(403)
  })

  it("retourne une erreur 403 quand l'utilisateur n'a pas de périmètre de recherche", async () => {
    // GIVEN
    utilisateurConnecte()
    vi.spyOn(perimetreModule, 'perimetreRechercheDuContexte').mockReturnValueOnce(null)
    const req = requete('saône')

    // WHEN
    const result = await GET(req)

    // THEN
    expect(result.status).toBe(403)
  })

  it('retourne une liste vide sans recherche quand le terme est trop court', async () => {
    // GIVEN
    utilisateurConnecte()
    vi.spyOn(perimetreModule, 'perimetreRechercheDuContexte').mockReturnValueOnce({ type: 'complet' })
    const spy = vi.spyOn(RechercherTerritoires.prototype, 'handle')
    const req = requete('s')

    // WHEN
    const result = await GET(req)

    // THEN
    expect(spy).not.toHaveBeenCalled()
    await expect(result.json()).resolves.toStrictEqual({ territoires: [], total: 0 })
  })

  it('recherche les territoires avec le périmètre du contexte et retourne le résultat', async () => {
    // GIVEN
    utilisateurConnecte()
    vi.spyOn(perimetreModule, 'perimetreRechercheDuContexte').mockReturnValueOnce({
      codesDepartement: ['69'],
      type: 'departements',
    })
    const readModel = {
      territoires: [{ code: '69', nom: 'Rhône', numeroDepartement: '69', type: 'departement' as const }],
      total: 1,
    }
    const spy = vi.spyOn(RechercherTerritoires.prototype, 'handle').mockResolvedValueOnce(readModel)
    const req = requete('rhône')

    // WHEN
    const result = await GET(req)

    // THEN
    expect(spy).toHaveBeenCalledWith({
      perimetre: { codesDepartement: ['69'], type: 'departements' },
      terme: 'rhône',
    })
    expect(result.status).toBe(200)
    await expect(result.json()).resolves.toStrictEqual(readModel)
  })
})

function requete(terme: string): NextRequest {
  return { nextUrl: { searchParams: new URLSearchParams(`q=${terme}`) } } as unknown as NextRequest
}

function utilisateurConnecte(): void {
  vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
  vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
  vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce({} as UnUtilisateurReadModel)
  vi.spyOn(resoudreContexteModule, 'resoudreContexte').mockResolvedValueOnce(
    new Contexte('gestionnaire_departement', [{ code: '69', type: 'departement' }])
  )
}
