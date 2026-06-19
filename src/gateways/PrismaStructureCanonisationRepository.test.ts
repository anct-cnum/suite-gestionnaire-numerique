import { main_structure_administrative } from '@prisma/client'
import { afterEach, describe, expect, it } from 'vitest'

import { PrismaStructureCanonisationRepository } from './PrismaStructureCanonisationRepository'
import { creerUneStructure } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { AdresseGeocodeReadModel } from '@/gateways/apiBan/BanGeocodingGateway'
import { Canonisation } from '@/use-cases/commands/CanoniserStructure'
import { EntrepriseReadModel } from '@/use-cases/queries/RechercherUneEntreprise'

const ANTENNE = 990031
const CANONIQUE = 990032
const SIRET = '99003100000001'
const CLEF_INTEROP = '99003_9999_00003'
const CODE_BAN = '99003999-0000-4000-8000-000000000003'
const CATEGORIE = '7389'

describe('canonisation de structure (repository Prisma)', () => {
  afterEach(nettoyer)

  it('aligne la structure sur l’image INSEE, la rend canonique, re-pointe l’adresse et journalise', async () => {
    // GIVEN une antenne et le code catégorie juridique présent en référence.
    await seedCategorie()
    await creerUneStructure({
      code_activite_principale: '99.99Z',
      denomination_antenne: 'Antenne à canoniser',
      id: ANTENNE,
      nom: 'Ancienne dénomination',
      siret: SIRET,
    })

    // WHEN
    const result = await new PrismaStructureCanonisationRepository().canoniser(canonisation({}))

    // THEN
    expect(result).toBe('OK')
    const structure = await lire(ANTENNE)
    expect(structure?.denomination_antenne).toBeNull()
    expect(structure?.denomination_sirene).toBe('AGENCE NATIONALE DE LA COHESION DES TERRITOIRES')
    expect(structure?.code_activite_principale).toBe('84.12Z')
    expect(structure?.etat_administratif).toBe('A')
    expect(structure?.edited_by).toBe('min')
    expect(structure?.last_sirene_enrich_at).not.toBeNull()
    await expect(clefInteropDeLAdresse(structure?.adresse_id)).resolves.toBe(CLEF_INTEROP)
    await expect(dernierAuditReussi()).resolves.toMatchObject({ moved_identifiers: { source: 'insee' } })
  })

  it('canonise sans re-pointer l’adresse quand le géocodage n’a rien rendu', async () => {
    // GIVEN
    await seedCategorie()
    await creerUneStructure({
      denomination_antenne: 'Antenne sans géocodage',
      id: ANTENNE,
      nom: 'Ancienne dénomination',
      siret: SIRET,
    })
    const adresseAvant = (await lire(ANTENNE))?.adresse_id

    // WHEN
    const result = await new PrismaStructureCanonisationRepository().canoniser(canonisation({ geocode: null }))

    // THEN
    expect(result).toBe('OK')
    const structure = await lire(ANTENNE)
    expect(structure?.denomination_antenne).toBeNull()
    expect(structure?.adresse_id).toBe(adresseAvant ?? null)
  })

  it('réutilise une adresse existante de même clef_interop BAN plutôt que d’en créer une', async () => {
    // GIVEN une adresse déjà présente avec la clef_interop renvoyée par le géocodage.
    await seedCategorie()
    const existante = await prisma.adresse.create({
      data: { clef_interop: CLEF_INTEROP, code_insee: '75107', code_postal: '75007', nom_commune: 'Paris' },
    })
    await creerUneStructure({ denomination_antenne: 'Antenne', id: ANTENNE, nom: 'Antenne', siret: SIRET })

    // WHEN
    const result = await new PrismaStructureCanonisationRepository().canoniser(canonisation({}))

    // THEN
    expect(result).toBe('OK')
    expect((await lire(ANTENNE))?.adresse_id).toBe(existante.id)
    await expect(prisma.adresse.count({ where: { clef_interop: CLEF_INTEROP } })).resolves.toBe(1)
  })

  it('réutilise une adresse existante via le code BAN unique, même si la clef_interop diffère', async () => {
    // GIVEN une adresse déjà présente avec un code_ban (colonne unique) mais sans clef_interop.
    await seedCategorie()
    const existante = await prisma.adresse.create({
      data: { code_ban: CODE_BAN, code_insee: '75107', code_postal: '75007', nom_commune: 'Paris' },
    })
    await creerUneStructure({ denomination_antenne: 'Antenne', id: ANTENNE, nom: 'Antenne', siret: SIRET })

    // WHEN le géocodage renvoie ce code_ban avec une clef_interop différente.
    const result = await new PrismaStructureCanonisationRepository().canoniser(
      canonisation({ geocode: { ...geocodeInsee, banClefInterop: 'autre_clef_99003', banCodeBan: CODE_BAN } })
    )

    // THEN on réutilise la ligne existante (pas de doublon, pas de violation d'unicité).
    expect(result).toBe('OK')
    expect((await lire(ANTENNE))?.adresse_id).toBe(existante.id)
    await expect(prisma.adresse.count({ where: { code_ban: CODE_BAN } })).resolves.toBe(1)
  })

  it('détecte la présence d’une canonique de même SIRET (hors structure courante)', async () => {
    // GIVEN une canonique (denomination_antenne null) et une antenne partageant le SIRET.
    await creerUneStructure({ id: CANONIQUE, nom: 'Canonique', siret: SIRET })
    await creerUneStructure({ denomination_antenne: 'Antenne', id: ANTENNE, nom: 'Antenne', siret: SIRET })
    const repository = new PrismaStructureCanonisationRepository()

    // THEN
    await expect(repository.existeCanoniquePourSiret(SIRET, ANTENNE)).resolves.toBe(true)
    await expect(repository.existeCanoniquePourSiret(SIRET, CANONIQUE)).resolves.toBe(false)
    await expect(repository.existeCanoniquePourSiret('00000000000000', ANTENNE)).resolves.toBe(false)
  })

  it('remonte canonisationEchouee et journalise l’échec quand l’update viole une contrainte', async () => {
    // GIVEN une catégorie juridique INSEE absente de la référence → violation de clé étrangère.
    await creerUneStructure({
      denomination_antenne: 'Antenne',
      id: ANTENNE,
      nom: 'Antenne',
      siret: SIRET,
    })

    // WHEN
    const result = await new PrismaStructureCanonisationRepository().canoniser(
      canonisation({ entreprise: { ...entrepriseInsee, categorieJuridiqueCode: '0000' } })
    )

    // THEN
    expect(result).toBe('canonisationEchouee')
    await expect(dernierAuditEchoue()).resolves.toBe(true)
    expect((await lire(ANTENNE))?.denomination_antenne).toBe('Antenne') // rollback : rien n'a changé
  })

  it('remonte canoniqueExistante en cas de collision sur la contrainte d’unicité (course)', async () => {
    // GIVEN une canonique de même SIRET existe déjà : rendre l'antenne canonique heurte la contrainte
    // UNIQUE (siret, denomination_antenne).
    await seedCategorie()
    await creerUneStructure({ id: CANONIQUE, nom: 'Canonique', siret: SIRET })
    await creerUneStructure({ denomination_antenne: 'Antenne', id: ANTENNE, nom: 'Antenne', siret: SIRET })

    // WHEN
    const result = await new PrismaStructureCanonisationRepository().canoniser(canonisation({ geocode: null }))

    // THEN
    expect(result).toBe('canoniqueExistante')
  })

  it('lit la structure à canoniser, ou null si absente', async () => {
    // GIVEN
    await creerUneStructure({ denomination_antenne: 'Antenne', id: ANTENNE, nom: 'Antenne', siret: SIRET })
    const repository = new PrismaStructureCanonisationRepository()

    // THEN
    await expect(repository.lireStructure(ANTENNE)).resolves.toStrictEqual({
      deletedAt: null,
      denominationAntenne: 'Antenne',
      siret: SIRET,
    })
    await expect(repository.lireStructure(123456)).resolves.toBeNull()
  })
})

const entrepriseInsee: EntrepriseReadModel = {
  activitePrincipale: '84.12Z',
  adresse: '20 AVENUE DE SEGUR, 75007 PARIS',
  categorieJuridiqueCode: CATEGORIE,
  codeInsee: '75107',
  codePostal: '75007',
  commune: 'PARIS',
  denomination: 'AGENCE NATIONALE DE LA COHESION DES TERRITOIRES',
  identifiant: SIRET,
  nomVoie: 'AVENUE DE SEGUR',
  numeroVoie: '20',
}

const geocodeInsee: AdresseGeocodeReadModel = {
  banClefInterop: CLEF_INTEROP,
  banCodeBan: null,
  banCodeInsee: '75107',
  banCodePostal: '75007',
  banLatitude: 48.85,
  banLongitude: 2.31,
  banNomCommune: 'Paris',
  banNomVoie: 'Avenue de Ségur',
  banNumeroVoie: 20,
  banRepetition: null,
  score: 0.98,
  type: 'housenumber',
}

function canonisation(override: Partial<Canonisation>): Canonisation {
  return {
    entreprise: entrepriseInsee,
    geocode: geocodeInsee,
    parUtilisateur: 'admin-test',
    structureId: ANTENNE,
    ...override,
  }
}

async function seedCategorie(): Promise<void> {
  await prisma.categories_juridiques.upsert({
    create: { code: CATEGORIE, niveau: 3, nom: 'Catégorie de test' },
    update: {},
    where: { code: CATEGORIE },
  })
}

async function lire(id: number): Promise<main_structure_administrative | null> {
  return prisma.main_structure_administrative.findUnique({ where: { id } })
}

async function clefInteropDeLAdresse(adresseId: null | number | undefined): Promise<null | string> {
  if (adresseId === null || adresseId === undefined) {
    return null
  }
  const adresse = await prisma.adresse.findUnique({ where: { id: adresseId } })
  return adresse?.clef_interop ?? null
}

async function dernierAuditReussi(): Promise<Record<string, unknown> | undefined> {
  const lignes = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT moved_identifiers FROM audit.structure_merge_log
    WHERE status = 'SUCCESS' AND dag_id = 'min-ui-canonisation' AND winner_id = ${ANTENNE}
    ORDER BY id DESC LIMIT 1
  `
  return lignes.at(0)
}

async function dernierAuditEchoue(): Promise<boolean> {
  const lignes = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM audit.structure_merge_log
    WHERE status = 'FAILURE' AND dag_id = 'min-ui-canonisation' AND winner_id = ${ANTENNE}
    ORDER BY id DESC LIMIT 1
  `
  return lignes.length > 0
}

async function nettoyer(): Promise<void> {
  await prisma.$executeRaw`DELETE FROM audit.structure_merge_log WHERE winner_id IN (${ANTENNE}, ${CANONIQUE})`
  await prisma.main_structure_administrative.deleteMany({ where: { id: { in: [ANTENNE, CANONIQUE] } } })
  await prisma.adresse.deleteMany({ where: { OR: [{ clef_interop: CLEF_INTEROP }, { code_ban: CODE_BAN }] } })
  await prisma.categories_juridiques.deleteMany({ where: { code: CATEGORIE } })
}
