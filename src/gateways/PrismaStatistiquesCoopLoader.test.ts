import { Prisma } from '@prisma/client'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { PrismaStatistiquesCoopLoader } from './PrismaStatistiquesCoopLoader'
import prisma from '../../prisma/prismaClient'

describe('statistiques coop loader', () => {
  // Le schéma coop (répliqué depuis dataspace en prod) n'est pas couvert par les
  // migrations Prisma : on matérialise le minimum requis par le loader.
  beforeAll(async () => {
    // Sérialise les fichiers de tests qui matérialisent le schéma coop (verrou tenu par la connexion
    // unique du worker, connection_limit=1) : le DROP SCHEMA du test de repointage ne doit pas
    // s'exécuter pendant qu'un autre fichier utilise ces tables.
    await prisma.$queryRaw`SELECT pg_advisory_lock(420001)::text`
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS coop`
    await prisma.$executeRaw`DO $$ BEGIN
      CREATE TYPE coop.thematique AS ENUM (
        'diagnostic_numerique', 'prendre_en_main_du_materiel', 'maintenance_de_materiel',
        'gere_ses_contenus_numeriques', 'navigation_sur_internet', 'email', 'bureautique', 'reseaux_sociaux',
        'sante', 'banque_et_achats_en_ligne', 'entrepreneuriat', 'insertion_professionnelle', 'securite_numerique',
        'parentalite', 'scolarite_et_numerique', 'creer_avec_le_numerique', 'culture_numerique',
        'intelligence_artificielle', 'aide_aux_demarches_administratives', 'papiers_elections_citoyennete',
        'famille_scolarite', 'social_sante', 'travail_formation', 'logement', 'transports_mobilite',
        'argent_impots', 'justice', 'etrangers_europe', 'loisirs_sports_culture', 'associations'
      );
    EXCEPTION WHEN duplicate_object THEN NULL; END $$`
    // La table peut préexister avec moins de colonnes (créée par un autre test) : on complète par ALTER.
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.activites (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      date date,
      suppression timestamp,
      accompagnements_count integer,
      structure_employeuse_id uuid
    )`
    await prisma.$executeRaw`ALTER TABLE coop.activites
      ADD COLUMN IF NOT EXISTS type text,
      ADD COLUMN IF NOT EXISTS mediateur_id uuid,
      ADD COLUMN IF NOT EXISTS duree integer,
      ADD COLUMN IF NOT EXISTS structure_id uuid,
      ADD COLUMN IF NOT EXISTS lieu_code_insee text,
      ADD COLUMN IF NOT EXISTS type_lieu text,
      ADD COLUMN IF NOT EXISTS materiel text[],
      ADD COLUMN IF NOT EXISTS thematiques coop.thematique[]`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.accompagnements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      activite_id uuid,
      beneficiaire_id uuid,
      premier_accompagnement boolean DEFAULT false
    )`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.beneficiaires (
      id uuid PRIMARY KEY,
      genre text,
      statut_social text,
      tranche_age text,
      annee_naissance integer,
      anonyme boolean DEFAULT false
    )`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.lieu_inclusion (
      id uuid PRIMARY KEY,
      code_insee text
    )`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.mediateurs (
      id uuid PRIMARY KEY,
      user_id uuid
    )`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS coop.users (
      id uuid PRIMARY KEY,
      is_conseiller_numerique boolean
    )`
  })

  afterAll(async () => prisma.$queryRaw`SELECT pg_advisory_unlock(420001)`)

  beforeEach(async () => {
    await prisma.$queryRaw`START TRANSACTION`
    await creerJeuDeDonnees()
  })

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('calcule les répartitions et totaux identiques à l’API Coop sur une période donnée', async () => {
    // GIVEN
    const loader = new PrismaStatistiquesCoopLoader()

    // WHEN
    const resultat = await loader.recupererStatistiques({ au: '2025-03-31', du: '2025-03-01', mediateurs: [M1] })

    // THEN
    expect(resultat.totaux).toStrictEqual({
      accompagnements: {
        // #1796 : collectifs.total = participants aux ateliers (l'API y mettait le nombre d'ateliers).
        collectifs: { proportion: 60, total: 3 },
        demarches: { proportion: 0, total: 0 },
        individuels: { proportion: 40, total: 2 },
        total: 5,
      },
      activites: {
        collectifs: { participants: 3, proportion: 33.333, total: 1 },
        demarches: { proportion: 0, total: 0 },
        individuels: { proportion: 66.667, total: 2 },
        total: 3,
      },
      beneficiaires: { anonymes: 1, nouveaux: 3, suivis: 3, total: 4 },
    })
    // Somme des participations, distincte de totaux.activites.total (nombre de CRA)
    expect(resultat.activites.totalAccompagnements).toBe(5)
    expect(resultat.activites.typeActivites).toStrictEqual([
      { count: 2, label: 'Accompagnement individuel', proportion: 40, value: 'Individuel' },
      { count: 3, label: 'Atelier collectif', proportion: 60, value: 'Collectif' },
    ])
    expect(resultat.activites.durees).toStrictEqual([
      { count: 1, label: 'Moins de 30 min', proportion: 20, value: '30' },
      { count: 1, label: '30min à 1 h', proportion: 20, value: '60' },
      { count: 0, label: '1 h à 2 h', proportion: 0, value: '120' },
      { count: 3, label: '2 h et plus', proportion: 60, value: 'more' },
    ])
    expect(resultat.activites.typeLieu).toStrictEqual([
      { count: 1, label: 'Lieu d’activité', proportion: 20, value: 'LieuActivite' },
      { count: 3, label: 'Autre lieu', proportion: 60, value: 'Autre' },
      { count: 0, label: 'À domicile', proportion: 0, value: 'Domicile' },
      { count: 1, label: 'À distance', proportion: 20, value: 'ADistance' },
    ])
    expect(resultat.activites.thematiques).toHaveLength(19)
    expect(resultat.activites.thematiques.filter((item) => item.count > 0)).toStrictEqual([
      { count: 1, label: 'E-mail', proportion: 20, value: 'Email' },
      { count: 4, label: 'Santé', proportion: 80, value: 'Sante' },
    ])
    expect(resultat.activites.thematiquesDemarches).toHaveLength(11)
    expect(resultat.activites.thematiquesDemarches.filter((item) => item.count > 0)).toStrictEqual([
      { count: 1, label: 'Logement', proportion: 100, value: 'Logement' },
    ])
    expect(resultat.activites.materiels).toStrictEqual([
      { count: 1, label: 'Ordinateur', proportion: 25, value: 'Ordinateur' },
      { count: 0, label: 'Téléphone', proportion: 0, value: 'Telephone' },
      { count: 3, label: 'Tablette', proportion: 75, value: 'Tablette' },
      { count: 0, label: 'Autre', proportion: 0, value: 'Autre' },
      { count: 0, label: 'Pas de matériel', proportion: 0, value: 'Aucun' },
    ])
    expect(resultat.beneficiaires.total).toBe(4)
    expect(resultat.beneficiaires.genres).toStrictEqual([
      { count: 1, label: 'Masculin', proportion: 25, value: 'Masculin' },
      { count: 2, label: 'Féminin', proportion: 50, value: 'Feminin' },
      { count: 1, label: 'Non communiqué', proportion: 25, value: 'NonCommunique' },
    ])
    expect(resultat.beneficiaires.statutsSocial).toStrictEqual([
      { count: 1, label: 'Retraité', proportion: 25, value: 'Retraite' },
      { count: 1, label: 'Sans emploi', proportion: 25, value: 'SansEmploi' },
      { count: 1, label: 'En emploi', proportion: 25, value: 'EnEmploi' },
      { count: 0, label: 'Scolarisé', proportion: 0, value: 'Scolarise' },
      { count: 1, label: 'Non communiqué ou hétérogène', proportion: 25, value: 'NonCommunique' },
    ])
    // L'année de naissance plausible fait foi ; sinon la tranche stockée (1850 → stockée, null → stockée).
    expect(resultat.beneficiaires.trancheAges).toStrictEqual([
      { count: 1, label: '70 ans et plus', proportion: 25, value: 'SoixanteDixPlus' },
      { count: 0, label: '60 - 69 ans', proportion: 0, value: 'SoixanteSoixanteNeuf' },
      { count: 1, label: '40 - 59 ans', proportion: 25, value: 'QuaranteCinquanteNeuf' },
      { count: 1, label: '25 - 39 ans', proportion: 25, value: 'VingtCinqTrenteNeuf' },
      { count: 0, label: '18 - 24 ans', proportion: 0, value: 'DixHuitVingtQuatre' },
      { count: 1, label: '12 - 17 ans', proportion: 25, value: 'DouzeDixHuit' },
      { count: 0, label: 'Moins de 12 ans', proportion: 0, value: 'MoinsDeDouze' },
      { count: 0, label: 'Non communiqué', proportion: 0, value: 'NonCommunique' },
    ])
    expect(resultat.accompagnementsParJour).toHaveLength(31)
    expect(resultat.accompagnementsParJour.filter((item) => item.count > 0)).toStrictEqual([
      { count: 1, label: '10/03' },
      { count: 1, label: '11/03' },
      { count: 3, label: '12/03' },
    ])
    // #1286 : la fenêtre mensuelle suit la période sélectionnée (comme la page « mes statistiques » de la Coop).
    expect(resultat.accompagnementsParMois).toStrictEqual([{ count: 5, label: '03/25' }])
  })

  it('sans bornes de dates : fenêtres par défaut (30 jours / 12 mois) et nouveaux à zéro', async () => {
    // GIVEN
    const loader = new PrismaStatistiquesCoopLoader()

    // WHEN
    const resultat = await loader.recupererStatistiques({ mediateurs: [M1] })

    // THEN : seule l'activité récente (A6, il y a 15 jours, 2 participants) est dans les fenêtres glissantes
    expect(resultat.accompagnementsParJour).toHaveLength(30)
    expect(resultat.accompagnementsParJour.reduce((somme, item) => somme + item.count, 0)).toBe(2)
    expect(resultat.accompagnementsParMois).toHaveLength(12)
    expect(resultat.accompagnementsParMois.reduce((somme, item) => somme + item.count, 0)).toBe(2)
    for (const item of resultat.accompagnementsParMois) {
      expect(item.label).toMatch(/^\d{2}\/\d{2}$/u)
    }
    // Comme l'API Coop : pas de comptage des nouveaux sans période complète du/au.
    expect(resultat.totaux.beneficiaires.nouveaux).toBe(0)
    expect(resultat.totaux.activites.total).toBe(4)
  })

  it.each([
    {
      attendu: 2,
      filtres: { departements: ['69'] },
      intention: 'par département via le lieu d’inclusion ou le code INSEE de l’activité',
    },
    {
      attendu: 1,
      filtres: { communes: ['01053'] },
      intention: 'par commune',
    },
    {
      attendu: 1,
      filtres: { mediateurs: [M1], types: ['Collectif' as const] },
      intention: 'par type d’activité',
    },
    {
      attendu: 3,
      filtres: { mediateurs: [M1], types: ['Demarche' as const] },
      intention: 'en ignorant le type Demarche comme l’API Coop',
    },
    {
      attendu: 3,
      filtres: { conseillerNumerique: true },
      intention: 'par appartenance au dispositif conseiller numérique',
    },
    {
      attendu: 1,
      filtres: { conseillerNumerique: false },
      intention: 'hors dispositif conseiller numérique',
    },
    {
      attendu: 1,
      filtres: { lieux: [S1] },
      intention: 'par lieu d’activité',
    },
    {
      attendu: 2,
      filtres: { beneficiaires: [BEN1] },
      intention: 'par bénéficiaire accompagné',
    },
    {
      attendu: 2,
      filtres: { thematiqueAdministratives: ['Logement'], thematiqueNonAdministratives: ['Email'] },
      intention: 'par thématiques administratives et non administratives',
    },
  ])('filtre les activités $intention', async ({ attendu, filtres }) => {
    // GIVEN
    const loader = new PrismaStatistiquesCoopLoader()

    // WHEN
    const resultat = await loader.recupererStatistiques({ au: '2025-03-31', du: '2025-03-01', ...filtres })

    // THEN
    expect(resultat.totaux.activites.total).toBe(attendu)
  })

  it('renvoie des proportions à zéro quand aucune activité ne correspond', async () => {
    // GIVEN
    const loader = new PrismaStatistiquesCoopLoader()

    // WHEN
    const resultat = await loader.recupererStatistiques({ au: '2030-01-02', du: '2030-01-01', mediateurs: [M1] })

    // THEN
    expect(resultat.totaux.activites).toStrictEqual({
      collectifs: { participants: 0, proportion: 0, total: 0 },
      demarches: { proportion: 0, total: 0 },
      individuels: { proportion: 0, total: 0 },
      total: 0,
    })
    expect(resultat.activites.typeActivites[0].proportion).toBe(0)
    expect(resultat.beneficiaires.total).toBe(0)
    expect(resultat.accompagnementsParJour).toHaveLength(2)
    expect(resultat.accompagnementsParJour.every((item) => item.count === 0)).toBe(true)
  })
})

const M1 = '11111111-1111-4111-8111-111111111111'
const M2 = '22222222-2222-4222-8222-222222222222'
const U1 = '31111111-1111-4111-8111-111111111111'
const U2 = '32222222-2222-4222-8222-222222222222'
const S1 = '41111111-1111-4111-8111-111111111111'
const BEN1 = '51111111-1111-4111-8111-111111111111'
const BEN2 = '52222222-2222-4222-8222-222222222222'
const BEN3 = '53333333-3333-4333-8333-333333333333'
const BEN4 = '54444444-4444-4444-8444-444444444444'
const A1 = '61111111-1111-4111-8111-111111111111'
const A2 = '62222222-2222-4222-8222-222222222222'
const A3 = '63333333-3333-4333-8333-333333333333'
const A4 = '64444444-4444-4444-8444-444444444444'
const A5 = '65555555-5555-4555-8555-555555555555'
const A6 = '66666666-6666-4666-8666-666666666666'

async function creerJeuDeDonnees(): Promise<void> {
  await prisma.$executeRaw`INSERT INTO coop.users (id, is_conseiller_numerique) VALUES
    (${U1}::uuid, true), (${U2}::uuid, false)`
  await prisma.$executeRaw`INSERT INTO coop.mediateurs (id, user_id) VALUES
    (${M1}::uuid, ${U1}::uuid), (${M2}::uuid, ${U2}::uuid)`
  await prisma.$executeRaw`INSERT INTO coop.lieu_inclusion (id, code_insee) VALUES (${S1}::uuid, '69381')`
  await prisma.$executeRaw`INSERT INTO coop.beneficiaires
    (id, genre, statut_social, tranche_age, annee_naissance, anonyme) VALUES
    (${BEN1}::uuid, 'masculin', 'retraite', NULL, 1950, false),
    (${BEN2}::uuid, NULL, NULL, 'douze_dix_huit', NULL, true),
    (${BEN3}::uuid, 'feminin', 'en_emploi', NULL, 1995, false),
    (${BEN4}::uuid, 'feminin', 'sans_emploi', 'quarante_cinquante_neuf', 1850, false)`
  await creerActivite({
    accompagnements: [{ beneficiaire: BEN1, premier: true }],
    date: Prisma.sql`'2025-03-10'::date`,
    duree: 20,
    id: A1,
    materiel: ['ordinateur'],
    structureId: S1,
    thematiques: ['sante', 'logement'],
    type: 'individuel',
    typeLieu: 'lieu_activite',
  })
  await creerActivite({
    accompagnements: [{ beneficiaire: BEN2, premier: false }],
    date: Prisma.sql`'2025-03-11'::date`,
    duree: 45,
    id: A2,
    lieuCodeInsee: '01053',
    materiel: [],
    thematiques: ['email'],
    type: 'individuel',
    typeLieu: 'a_distance',
  })
  await creerActivite({
    accompagnements: [
      { beneficiaire: BEN1, premier: false },
      { beneficiaire: BEN3, premier: true },
      { beneficiaire: BEN4, premier: true },
    ],
    date: Prisma.sql`'2025-03-12'::date`,
    duree: 120,
    id: A3,
    lieuCodeInsee: '69002',
    materiel: ['tablette'],
    thematiques: ['sante'],
    type: 'collectif',
    typeLieu: 'autre',
  })
  // Activité supprimée : toujours exclue
  await creerActivite({
    accompagnements: [{ beneficiaire: BEN1, premier: false }],
    date: Prisma.sql`'2025-03-13'::date`,
    duree: 60,
    id: A4,
    materiel: [],
    suppression: true,
    thematiques: [],
    type: 'individuel',
    typeLieu: 'autre',
  })
  // Activité d'un autre médiateur, hors dispositif conseiller numérique
  await creerActivite({
    accompagnements: [{ beneficiaire: BEN2, premier: false }],
    date: Prisma.sql`'2025-03-15'::date`,
    duree: 30,
    id: A5,
    lieuCodeInsee: '33063',
    materiel: [],
    mediateurId: M2,
    thematiques: [],
    type: 'individuel',
    typeLieu: 'autre',
  })
  // Activité récente (fenêtres glissantes par défaut : 30 jours / 12 mois)
  await creerActivite({
    accompagnements: [
      { beneficiaire: BEN1, premier: false },
      { beneficiaire: BEN3, premier: false },
    ],
    date: Prisma.sql`(CURRENT_DATE - INTERVAL '15 days')::date`,
    duree: 60,
    id: A6,
    materiel: [],
    thematiques: [],
    type: 'collectif',
    typeLieu: 'autre',
  })
}

function citer(valeur: string): string {
  return `'${valeur}'`
}

async function creerActivite(
  params: Readonly<{
    accompagnements: ReadonlyArray<Readonly<{ beneficiaire: string; premier: boolean }>>
    date: Prisma.Sql
    duree: number
    id: string
    lieuCodeInsee?: string
    materiel: ReadonlyArray<string>
    mediateurId?: string
    structureId?: string
    suppression?: boolean
    thematiques: ReadonlyArray<string>
    type: string
    typeLieu: string
  }>
): Promise<void> {
  const thematiques = Prisma.raw(`ARRAY[${params.thematiques.map(citer).join(', ')}]::coop.thematique[]`)
  const materiel = Prisma.raw(`ARRAY[${params.materiel.map(citer).join(', ')}]::text[]`)
  await prisma.$executeRaw`INSERT INTO coop.activites
    (id, type, mediateur_id, date, duree, structure_id, lieu_code_insee, suppression, type_lieu, materiel,
     thematiques, accompagnements_count) VALUES (
    ${params.id}::uuid,
    ${params.type},
    ${params.mediateurId ?? M1}::uuid,
    ${params.date},
    ${params.duree},
    ${params.structureId ?? null}::uuid,
    ${params.lieuCodeInsee ?? null},
    ${params.suppression === true ? Prisma.sql`NOW()` : Prisma.sql`NULL`},
    ${params.typeLieu},
    ${materiel},
    ${thematiques},
    ${params.accompagnements.length})`
  for (const accompagnement of params.accompagnements) {
    await prisma.$executeRaw`INSERT INTO coop.accompagnements (activite_id, beneficiaire_id, premier_accompagnement)
      VALUES (${params.id}::uuid, ${accompagnement.beneficiaire}::uuid, ${accompagnement.premier})`
  }
}
