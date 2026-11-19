import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

import { GET } from './route'
import prisma from '../../../../../prisma/prismaClient'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('route export CSV des contacts des membres', () => {
  it('devrait retourner une erreur 401 quand l’utilisateur n’est pas authentifié', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce(null)

    // WHEN
    const result = await GET(creerRequete([['codeDepartement', '69']]))

    // THEN
    expect(result.status).toBe(401)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Non autorisé' })
  })

  it('devrait retourner une erreur 403 quand un non administrateur demande l’export de toutes les gouvernances', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(gestionnaireStructure())
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([
      { codeDepartement: '69', estCoporteur: true },
    ])
    const spiedFindMany = vi.spyOn(prisma.gouvernanceRecord, 'findMany')

    // WHEN
    const result = await GET(creerRequete())

    // THEN
    expect(result.status).toBe(403)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Accès refusé' })
    expect(spiedFindMany).not.toHaveBeenCalled()
  })

  it('devrait retourner le CSV des contacts des membres de toutes les gouvernances pour un administrateur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    const spiedFindMany = vi.spyOn(prisma.gouvernanceRecord, 'findMany').mockResolvedValueOnce([
      gouvernanceRecord('01', 'Ain', [
        membreRecord({
          contacts: [contactRecord({ est_referent_fne: true, nom: 'Dupont', prenom: 'Jeanne' })],
          isCoporteur: true,
          nom: 'Préfecture de l’Ain',
          siret: '11111111111111',
          statut: 'confirme',
        }),
      ]),
      gouvernanceRecord('69', 'Rhône', [
        membreRecord({ contacts: [], nom: 'Mairie, de Lyon', siret: null, statut: 'candidat' }),
      ]),
    ] as never)

    // WHEN
    const result = await GET(creerRequete())

    // THEN
    expect(spiedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { departementCode: 'asc' },
        where: {},
      })
    )
    expect(spiedFindMany.mock.calls[0][0]?.include?.membres).toMatchObject({
      where: { statut: { in: ['candidat', 'confirme'] } },
    })
    expect(result.status).toBe(200)
    expect(result.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(result.headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="contacts-membres-gouvernances-.*\.csv"$/
    )
    const octets = new Uint8Array(await result.arrayBuffer())
    // BOM UTF-8 en tête pour qu’Excel ouvre le fichier avec les accents corrects
    expect([...octets.slice(0, 3)]).toStrictEqual([239, 187, 191])
    expect(new TextDecoder().decode(octets.slice(3))).toBe(
      [
        'Code département,Département,Structure,SIRET,Typologie,Statut,Rôles,Nom,Prénom,Email,Téléphone,Fonction,Referent FNE',
        '01,Ain,Préfecture de l’Ain,11111111111111,Commune,Confirmé,Co-porteur,Dupont,Jeanne,jeanne.dupont@example.net,0102030405,Directrice,Oui',
        '69,Rhône,"Mairie, de Lyon",,Commune,Candidat,,,,,,,',
      ].join('\n')
    )
  })

  it('devrait retourner une erreur 403 quand l’utilisateur n’est pas dans la gouvernance demandée', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(gestionnaireStructure())
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([
      { codeDepartement: '93', estCoporteur: false },
    ])
    const spiedFindMany = vi.spyOn(prisma.gouvernanceRecord, 'findMany')

    // WHEN
    const result = await GET(creerRequete([['codeDepartement', '69']]))

    // THEN
    expect(result.status).toBe(403)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Accès refusé' })
    expect(spiedFindMany).not.toHaveBeenCalled()
  })

  it('devrait retourner le CSV des contacts des membres d’une gouvernance filtrés par statut et par rôle', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        departementCode: '69',
        role: {
          categorie: 'maille',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire département',
          organisation: '',
          rolesGerables: [],
          type: 'gestionnaire_departement',
        },
      })
    )
    const spiedFindMany = vi.spyOn(prisma.gouvernanceRecord, 'findMany').mockResolvedValueOnce([
      gouvernanceRecord('69', 'Rhône', [
        membreRecord({
          contacts: [contactRecord()],
          isCoporteur: true,
          nom: 'Métropole de Lyon',
          statut: 'confirme',
        }),
        membreRecord({ contacts: [contactRecord()], nom: 'Mairie de Lyon', statut: 'confirme' }),
      ]),
    ] as never)

    // WHEN
    const result = await GET(
      creerRequete([
        ['codeDepartement', '69'],
        ['statut', 'confirme'],
        ['role', 'coporteur'],
      ])
    )

    // THEN
    expect(spiedFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { departementCode: '69' } }))
    expect(spiedFindMany.mock.calls[0][0]?.include?.membres).toMatchObject({ where: { statut: 'confirme' } })
    expect(result.headers.get('Content-Disposition')).toMatch(/^attachment; filename="contacts-membres-\d.*\.csv"$/)
    const csv = new TextDecoder().decode(new Uint8Array(await result.arrayBuffer()).slice(3))
    expect(csv.split('\n')).toStrictEqual([
      'Code département,Département,Structure,SIRET,Typologie,Statut,Rôles,Nom,Prénom,Email,Téléphone,Fonction,Referent FNE',
      '69,Rhône,Métropole de Lyon,12345678900011,Commune,Confirmé,Co-porteur,Tartempion,Martin,jeanne.dupont@example.net,0102030405,Directrice,Non',
    ])
  })

  it('devrait retourner une erreur 500 quand la récupération échoue', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSession').mockResolvedValueOnce({ user: {} as ssoGateway.Profile })
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(utilisateurReadModelFactory())
    vi.spyOn(prisma.gouvernanceRecord, 'findMany').mockRejectedValueOnce(new Error('erreur'))
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined)

    // WHEN
    const result = await GET(creerRequete([['codeDepartement', '69']]))

    // THEN
    expect(result.status).toBe(500)
    await expect(result.json()).resolves.toStrictEqual({ error: 'Erreur interne du serveur' })
  })
})

function gestionnaireStructure(): UnUtilisateurReadModel {
  return utilisateurReadModelFactory({
    role: {
      categorie: 'structure',
      doesItBelongToGroupeAdmin: false,
      nom: 'Gestionnaire structure',
      organisation: '',
      rolesGerables: [],
      type: 'gestionnaire_structure',
    },
    structureId: 42,
  })
}

function creerRequete(params: ReadonlyArray<[string, string]> = []): NextRequest {
  return { nextUrl: { searchParams: new URLSearchParams([...params]) } } as unknown as NextRequest
}

function gouvernanceRecord(
  departementCode: string,
  nomDepartement: string,
  membres: ReadonlyArray<ReturnType<typeof membreRecord>>
): object {
  return { departementCode, membres, relationDepartement: { nom: nomDepartement } }
}

function membreRecord(
  override: Readonly<{
    contacts: ReadonlyArray<ReturnType<typeof contactRecord>>
    isCoporteur?: boolean
    nom: string
    siret?: null | string
    statut: string
  }>
): object {
  return {
    BeneficiaireSubventionRecord: [],
    CoFinancementRecord: [],
    id: `membre-${override.nom}`,
    isCoporteur: override.isCoporteur ?? false,
    relationStructureAdministrative: {
      categories_juridiques: { nom: 'Commune' },
      contact_structures: override.contacts.map((contact) => ({ contact })),
      denomination_antenne: null,
      denomination_sirene: override.nom,
      siret: override.siret === undefined ? '12345678900011' : override.siret,
    },
    statut: override.statut,
    structureId: 1,
  }
}

function contactRecord(
  override: Partial<Readonly<{ est_referent_fne: boolean; nom: string; prenom: string }>> = {}
): Readonly<Record<string, boolean | string>> {
  return {
    email: 'jeanne.dupont@example.net',
    est_referent_fne: false,
    fonction: 'Directrice',
    nom: 'Tartempion',
    prenom: 'Martin',
    telephone: '0102030405',
    ...override,
  }
}
