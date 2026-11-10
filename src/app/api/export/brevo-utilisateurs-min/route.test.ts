import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import { PrismaGouvernanceStructureLoader } from '@/gateways/PrismaGouvernanceStructureLoader'
import { PrismaTerritoireLoader } from '@/gateways/PrismaTerritoireLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

const secret = 'secret-de-test'

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

describe('route export Brevo des utilisateurs de MIN', () => {
  it.each([
    {
      authorization: `Bearer ${secret}`,
      intention: 'aucun secret n’est configuré',
      secretConfigure: undefined,
    },
    {
      authorization: 'Bearer ',
      intention: 'le secret configuré est vide',
      secretConfigure: '',
    },
    {
      authorization: undefined,
      intention: 'l’appel ne transmet pas d’en-tête d’autorisation',
      secretConfigure: secret,
    },
    {
      authorization: 'Bearer mauvais-secret',
      intention: 'l’appel transmet un mauvais secret',
      secretConfigure: secret,
    },
    {
      authorization: secret,
      intention: 'l’appel transmet le secret sans le préfixe Bearer',
      secretConfigure: secret,
    },
  ])('devrait refuser l’accès quand $intention', async ({ authorization, secretConfigure }) => {
    // GIVEN
    vi.stubEnv('EXPORT_BREVO_SECRET', secretConfigure)
    const spiedTousLesUtilisateurs = vi.spyOn(PrismaUtilisateurLoader.prototype, 'tousLesUtilisateurs')

    // WHEN
    const result = await GET(requete(authorization))

    // THEN
    expect(result.status).toBe(401)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Non autorisé' })
    expect(spiedTousLesUtilisateurs).not.toHaveBeenCalled()
  })

  it('devrait retourner le CSV de tous les utilisateurs sans téléphone, SIRET ni territoires quand le secret est correct', async () => {
    // GIVEN
    vi.stubEnv('EXPORT_BREVO_SECRET', secret)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'tousLesUtilisateurs').mockResolvedValueOnce([
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
    ])
    const spiedRecupererTerritoires = vi
      .spyOn(PrismaTerritoireLoader.prototype, 'recupererTerritoires')
      .mockResolvedValueOnce({
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
    const result = await GET(requete(`Bearer ${secret}`))

    // THEN
    expect(spiedRecupererTerritoires).toHaveBeenCalledWith([1])
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    const octets = new Uint8Array(await result.arrayBuffer())
    expect([...octets.slice(0, 3)]).toStrictEqual([239, 187, 191])
    const csv = new TextDecoder().decode(octets.slice(3))
    const lignes = [
      [
        'Nom',
        'Prénom',
        'Adresse électronique',
        'Rôle',
        'Structure',
        'Département',
        'Région',
        'Statut',
        'Dernière connexion',
        'Statut de la structure',
        'Rôle gouvernance',
      ],
      [
        '"Bernard, le sage"',
        'Paul',
        'p@ex.net',
        'Gestionnaire structure',
        'Structure Coporteuse',
        '',
        '',
        'Activé',
        '01/01/1970',
        'validée',
        'coporteur',
      ],
      [
        'Avare',
        'Harpagon',
        'anne@example.net',
        'Gestionnaire département',
        'Rhône (69)',
        'Rhône',
        'Auvergne-Rhône-Alpes',
        'En attente',
        '',
        '',
        '',
      ],
    ]
    expect(csv).toBe(lignes.map((ligne) => ligne.join(',')).join('\n'))
  })

  it('devrait retourner une erreur 500 quand la récupération échoue', async () => {
    // GIVEN
    vi.stubEnv('EXPORT_BREVO_SECRET', secret)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'tousLesUtilisateurs').mockRejectedValueOnce(new Error('erreur'))
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined)

    // WHEN
    const result = await GET(requete(`Bearer ${secret}`))

    // THEN
    expect(result.status).toBe(500)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Erreur interne du serveur' })
  })
})

function requete(authorization: string | undefined): NextRequest {
  return new NextRequest('http://localhost/api/export/brevo-utilisateurs-min', {
    headers: authorization === undefined ? {} : { authorization },
  })
}
