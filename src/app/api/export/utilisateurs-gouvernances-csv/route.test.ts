import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceStructureLoader } from '@/gateways/PrismaGouvernanceStructureLoader'
import { PrismaTerritoireLoader } from '@/gateways/PrismaTerritoireLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

const roleGestionnaireStructure = {
  categorie: 'structure',
  doesItBelongToGroupeAdmin: false,
  nom: 'Gestionnaire structure',
  organisation: 'Structure Coporteuse',
  rolesGerables: ['Gestionnaire structure'],
  type: 'gestionnaire_structure',
} as const

const roleGestionnaireDepartement = {
  categorie: 'maille',
  doesItBelongToGroupeAdmin: false,
  nom: 'Gestionnaire département',
  organisation: 'Rhône (69)',
  rolesGerables: ['Gestionnaire département'],
  type: 'gestionnaire_departement',
} as const

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
      utilisateurReadModelFactory({ role: roleGestionnaireStructure })
    )

    // WHEN
    const result = await GET()

    // THEN
    expect(result.status).toBe(403)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Accès refusé' })
  })

  it('devrait retourner le CSV, étendu aux utilisateurs hors gouvernance, pour un admin dispositif', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    const spiedHandle = vi.spyOn(RechercherMesUtilisateurs.prototype, 'handle').mockResolvedValueOnce({
      total: 3,
      utilisateursCourants: [
        utilisateurReadModelFactory({
          email: 'p@ex.net',
          nom: 'Bernard, le sage',
          prenom: 'Paul',
          role: roleGestionnaireStructure,
          structureId: 1,
          telephone: '0102030405',
        }),
        utilisateurReadModelFactory({
          departementCode: '69',
          email: 'anne@example.net',
          isActive: false,
          nom: 'Avare',
          prenom: 'Harpagon',
          role: roleGestionnaireDepartement,
          telephone: '0102030406',
        }),
        utilisateurReadModelFactory({
          email: 'zoe@example.net',
          nom: 'Fabre',
          prenom: 'Zoé',
          role: { ...roleGestionnaireStructure, organisation: 'Structure Hors Gouvernance' },
          structureId: 2,
          telephone: '0102030407',
        }),
      ],
    })
    vi.spyOn(PrismaTerritoireLoader.prototype, 'recupererTerritoires').mockResolvedValueOnce({
      departements: [{ code: '69', nom: 'Rhône', regionCode: '84', regionNom: 'Auvergne-Rhône-Alpes' }],
      structureDepartements: new Map(),
    })
    vi.spyOn(PrismaGouvernanceStructureLoader.prototype, 'recupererGouvernanceDesStructures').mockResolvedValueOnce(
      new Map([
        [
          1,
          {
            roleGouvernance: 'coporteur',
            siret: '11111111111111',
            statutStructure: 'validée',
            territoires: ['Rhône'],
          },
        ],
      ])
    )

    // WHEN
    const result = await GET()

    // THEN
    expect(spiedHandle).toHaveBeenCalledWith({ pageCourante: 0, uid: 1, utilisateursParPage: 100000 })
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(result.headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="utilisateurs-gouvernances-.*\.csv"$/
    )
    const octets = new Uint8Array(await result.arrayBuffer())
    // BOM UTF-8 en tête pour qu’Excel ouvre le fichier avec les accents corrects
    expect([...octets.slice(0, 3)]).toStrictEqual([239, 187, 191])
    const csv = new TextDecoder().decode(octets.slice(3))
    const lignes = [
      [
        'Nom',
        'Prénom',
        'Adresse électronique',
        'Téléphone',
        'Rôle',
        'Structure',
        'Département',
        'Région',
        'Statut',
        'Dernière connexion',
        'SIRET',
        'Statut de la structure',
        'Territoires',
        'Rôle gouvernance',
      ],
      [
        '"Bernard, le sage"',
        'Paul',
        'p@ex.net',
        '0102030405',
        'Gestionnaire structure',
        'Structure Coporteuse',
        '',
        '',
        'Activé',
        '01/01/1970',
        '11111111111111',
        'validée',
        'Rhône',
        'coporteur',
      ],
      [
        'Avare',
        'Harpagon',
        'anne@example.net',
        '0102030406',
        'Gestionnaire département',
        'Rhône (69)',
        'Rhône',
        'Auvergne-Rhône-Alpes',
        'En attente',
        '',
        '',
        '',
        'Rhône',
        '',
      ],
      [
        'Fabre',
        'Zoé',
        'zoe@example.net',
        '0102030407',
        'Gestionnaire structure',
        'Structure Hors Gouvernance',
        '',
        '',
        'Activé',
        '01/01/1970',
        '',
        '',
        '',
        '',
      ],
    ]
    expect(csv).toBe(lignes.map((ligne) => ligne.join(',')).join('\n'))
  })

  it('devrait retourner une erreur 500 quand la récupération échoue', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(RechercherMesUtilisateurs.prototype, 'handle').mockRejectedValueOnce(new Error('erreur'))
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined)

    // WHEN
    const result = await GET()

    // THEN
    expect(result.status).toBe(500)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Erreur interne du serveur' })
  })
})
