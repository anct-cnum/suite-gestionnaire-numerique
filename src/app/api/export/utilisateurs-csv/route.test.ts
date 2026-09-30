import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaTerritoireLoader } from '@/gateways/PrismaTerritoireLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

function creerRequete(params: ReadonlyArray<[string, string]> = []): NextRequest {
  return { nextUrl: { searchParams: new URLSearchParams(params) } } as unknown as NextRequest
}

describe('route export CSV des utilisateurs', () => {
  it('devrait retourner une erreur 401 quand l’utilisateur n’est pas authentifié', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)

    // WHEN
    const result = await GET(creerRequete())

    // THEN
    expect(result.status).toBe(401)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Non autorisé' })
  })

  it('devrait retourner une erreur 403 quand l’utilisateur n’est pas administrateur de dispositif', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        role: {
          categorie: 'structure',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire structure',
          organisation: '',
          rolesGerables: [],
          type: 'gestionnaire_structure',
        },
      })
    )

    // WHEN
    const result = await GET(creerRequete())

    // THEN
    expect(result.status).toBe(403)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Accès refusé' })
  })

  it('devrait retourner le CSV des utilisateurs en transmettant les filtres de la requête', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    const spiedHandle = vi.spyOn(RechercherMesUtilisateurs.prototype, 'handle').mockResolvedValueOnce({
      total: 1,
      utilisateursCourants: [utilisateurReadModelFactory({ isActive: false })],
    })
    vi.spyOn(PrismaTerritoireLoader.prototype, 'recupererTerritoires').mockResolvedValueOnce({
      departements: [],
      structureDepartements: new Map(),
    })

    // WHEN
    const result = await GET(
      creerRequete([
        ['codeDepartement', '69'],
        ['roles', 'administrateur_dispositif,gestionnaire_departement'],
        ['utilisateursActives', 'on'],
      ])
    )

    // THEN
    expect(spiedHandle).toHaveBeenCalledWith({
      codeDepartement: '69',
      codeEpci: '0',
      codeRegion: '0',
      idStructure: undefined,
      pageCourante: 0,
      prenomOuNomOuEmail: undefined,
      roles: ['administrateur_dispositif', 'gestionnaire_departement'],
      uid: 1,
      utilisateursActives: true,
      utilisateursParPage: 100000,
    })
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(result.headers.get('Content-Disposition')).toMatch(/^attachment; filename="utilisateurs-.*\.csv"$/)
    const octets = new Uint8Array(await result.arrayBuffer())
    // BOM UTF-8 en tête pour qu’Excel ouvre le fichier avec les accents corrects
    expect([...octets.slice(0, 3)]).toStrictEqual([239, 187, 191])
    const csv = new TextDecoder().decode(octets.slice(3))
    expect(csv).toBe(
      [
        'Nom,Prénom,Adresse électronique,Téléphone,Rôle,Structure,Département,Région,Statut,Dernière connexion',
        'Tartempion,Martin,martin.tartempion@example.net,0102030405,Administrateur dispositif,,,,En attente,',
      ].join('\n')
    )
  })

  it('devrait retourner une erreur 500 quand la récupération échoue', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(RechercherMesUtilisateurs.prototype, 'handle').mockRejectedValueOnce(new Error('erreur'))
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined)

    // WHEN
    const result = await GET(creerRequete())

    // THEN
    expect(result.status).toBe(500)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Erreur interne du serveur' })
  })
})
