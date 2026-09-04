import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { epochTime } from '@/shared/testHelper'
import { RecupererUtilisateursAExporter } from '@/use-cases/queries/RecupererUtilisateursAExporter'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('route export CSV des utilisateurs des gouvernances', () => {
  it('devrait retourner une erreur 401 quand l’utilisateur n’est pas authentifié', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)

    // WHEN
    const result = await GET()

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
    const result = await GET()

    // THEN
    expect(result.status).toBe(403)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Accès refusé' })
  })

  it('devrait retourner le CSV des utilisateurs quand l’utilisateur est administrateur de dispositif', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(RecupererUtilisateursAExporter.prototype, 'handle').mockResolvedValueOnce([
      {
        derniereConnexion: epochTime,
        email: 'p@ex.net',
        isActive: true,
        nom: 'Bernard, le sage',
        prenom: 'Paul',
        role: 'coporteur',
        siret: '11111111111111',
        structure: 'Coporteuse',
        telephone: '0102030405',
        territoires: ['Rhône'],
      },
      {
        derniereConnexion: null,
        email: 'anne@example.net',
        isActive: false,
        nom: 'Avare',
        prenom: 'Harpagon',
        role: 'gestionnaire département',
        siret: '',
        structure: '',
        telephone: '0102030406',
        territoires: ['Rhône'],
      },
    ])

    // WHEN
    const result = await GET()

    // THEN
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(result.headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="utilisateurs-gouvernances-.*\.csv"$/
    )
    const octets = new Uint8Array(await result.arrayBuffer())
    // BOM UTF-8 en tête pour qu’Excel ouvre le fichier avec les accents corrects
    expect([...octets.slice(0, 3)]).toStrictEqual([239, 187, 191])
    const csv = new TextDecoder().decode(octets.slice(3))
    expect(csv).toBe(
      [
        'Nom,Prénom,Adresse électronique,Téléphone,Rôle,Structure,SIRET,Territoires,Statut,Dernière connexion',
        '"Bernard, le sage",Paul,p@ex.net,0102030405,coporteur,Coporteuse,11111111111111,Rhône,Activé,01/01/1970',
        'Avare,Harpagon,anne@example.net,0102030406,gestionnaire département,,,Rhône,En attente,',
      ].join('\n')
    )
  })

  it('devrait retourner une erreur 500 quand la récupération échoue', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(RecupererUtilisateursAExporter.prototype, 'handle').mockRejectedValueOnce(new Error('erreur'))
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined)

    // WHEN
    const result = await GET()

    // THEN
    expect(result.status).toBe(500)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Erreur interne du serveur' })
  })
})
