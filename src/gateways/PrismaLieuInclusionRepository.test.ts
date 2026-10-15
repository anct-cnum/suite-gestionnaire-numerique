import { randomUUID } from 'node:crypto'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { PrismaLieuInclusionRepository } from './PrismaLieuInclusionRepository'
import { contexteJournalisationMin } from './shared/contexteJournalisationMin'
import { creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { StructureUid } from '@/domain/Structure'
import { epochTime } from '@/shared/testHelper'
import { CreerLieuInclusionData } from '@/use-cases/commands/shared/LieuInclusionRepository'

const LIEU_ID = 991882
const SOURCE_INITIALE = 'dora'

describe('repository Prisma des lieux d’inclusion', () => {
  beforeEach(async () => {
    await prisma.main_lieu_inclusion.create({
      data: {
        id: LIEU_ID,
        nom: 'Lieu test source',
        source: SOURCE_INITIALE,
        visible_pour_cartographie_nationale: true,
      },
    })
  })

  afterEach(async () => {
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: LIEU_ID } })
  })

  it('une écriture de données signe la ligne : source MIN, éditeur min, date de modification MIN (#1951)', async () => {
    // WHEN
    await new PrismaLieuInclusionRepository().updateServicesTypePublic({
      date: epochTime,
      priseEnChargeSpecifique: [],
      publicsSpecifiquementAdresses: [],
      structureUid: new StructureUid(LIEU_ID),
    })

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: LIEU_ID } })
    expect(lieu.source).toBe('Mon Inclusion Numérique')
    expect(lieu.edited_by).toBe('min')
    expect(lieu.updated_at_min).toStrictEqual(epochTime)
  })

  it('écrit le courriel du lieu sous la clé email, celle que lisent la Coop et api.carto (#2106)', async () => {
    // GIVEN
    await prisma.main_lieu_inclusion.update({
      data: { contact: { courriels: { email: 'ancien@exemple.fr' }, telephone: '+33102030405' } },
      where: { id: LIEU_ID },
    })

    // WHEN
    await new PrismaLieuInclusionRepository().updateServicesModalite({
      date: epochTime,
      email: 'lieu@exemple.fr',
      fraisACharge: [],
      modalitesAcces: [],
      structureUid: new StructureUid(LIEU_ID),
    })

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: LIEU_ID } })
    expect(lieu.contact).toStrictEqual({ courriels: { email: 'lieu@exemple.fr' }, telephone: '+33102030405' })
  })

  it('un changement de visibilité ne touche pas à la source : c’est un état, pas une donnée (#1951)', async () => {
    // WHEN
    await new PrismaLieuInclusionRepository().updateVisibiliteCartographie({
      date: epochTime,
      structureUid: new StructureUid(LIEU_ID),
      visiblePourCartographie: false,
    })

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: LIEU_ID } })
    expect(lieu.visible_pour_cartographie_nationale).toBe(false)
    expect(lieu.source).toBe(SOURCE_INITIALE)
    expect(lieu.edited_by).toBe('min')
    expect(lieu.updated_at_min).toStrictEqual(epochTime)
  })

  it('une suppression ne touche pas à la source et masque le lieu (#1951)', async () => {
    // WHEN
    await new PrismaLieuInclusionRepository().supprimer({
      date: epochTime,
      structureUid: new StructureUid(LIEU_ID),
    })

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: LIEU_ID } })
    expect(lieu.deleted_at).toStrictEqual(epochTime)
    expect(lieu.visible_pour_cartographie_nationale).toBe(false)
    expect(lieu.source).toBe(SOURCE_INITIALE)
    expect(lieu.edited_by).toBe('min')
  })
})

// Création d'un lieu (#1495). Données namespacées : commune fictive « Testville 1495 »,
// nettoyée après chaque test (lieux puis adresses, FK oblige).
describe('repository Prisma des lieux d’inclusion — création (#1495)', () => {
  beforeAll(async () => {
    // Le schéma source est hors Prisma (migration externe) : provisionné pour la base de
    // test, comme dans journalisationMin.test (l'ordre des fichiers est aléatoire).
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS source`
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS source.min__evenements (
      id BIGSERIAL PRIMARY KEY,
      run_id TEXT NOT NULL,
      ingested_at TIMESTAMPTZ DEFAULT now(),
      source_key TEXT NOT NULL,
      donnee JSONB NOT NULL
    )`
  })

  afterEach(async () => {
    await prisma.main_lieu_inclusion.deleteMany({ where: { nom: { startsWith: 'Lieu test 1495' } } })
    await prisma.adresse.deleteMany({ where: { nom_commune: COMMUNE_TEST } })
    await prisma.utilisateurRecord.deleteMany({ where: { ssoId: SSO_ACTEUR } })
  })

  it('crée un lieu sans SIRET avec une adresse BAN neuve, signé MIN, sorti du cycle de vie carto', async () => {
    // WHEN
    const codeBan = randomUUID()
    const lieuId = await new PrismaLieuInclusionRepository().creer(
      donneesCreation({ adresseEnrichie: { ...adresseBan, banCodeBan: codeBan }, visiblePourCartographie: true })
    )

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: lieuId } })
    expect(lieu.nom).toBe('Lieu test 1495 sans siret')
    expect(lieu.source).toBe('Mon Inclusion Numérique')
    expect(lieu.edited_by).toBe('min')
    expect(lieu.updated_at_min).toStrictEqual(epochTime)
    expect(lieu.visible_pour_cartographie_nationale).toBe(true)
    expect(lieu.itinerance).toStrictEqual(['Itinerant'])
    expect(lieu.typologies).toStrictEqual(['BIB'])
    expect(lieu.complement_adresse).toBe('Bât. B')
    expect(lieu.siret_a_l_enrichissement).toBeNull()
    expect(lieu.structure_cartographie_nationale_id).toBeNull()
    expect(lieu.structure_coop_id).toBeNull()
    expect(lieu.deleted_at).toBeNull()
    expect(lieu.created_at).not.toBeNull()
    const [adresse] = await prisma.$queryRaw<
      Array<{ clef_interop: string; code_ban: string; longitude: number; repetition: null | string }>
    >`SELECT clef_interop, code_ban, public.ST_X(geom) AS longitude, repetition FROM main.adresse WHERE id = ${lieu.adresse_id}`
    expect(adresse.clef_interop).toBe(adresseBan.banClefInterop)
    expect(adresse.code_ban).toBe(codeBan)
    expect(adresse.longitude).toBeCloseTo(2.331)
    expect(adresse.repetition).toBe('B')
  })

  it('crée un lieu avec SIRET sur les composants SIRENE quand la BAN n’a rien trouvé (champs BAN vides)', async () => {
    // WHEN
    const lieuId = await new PrismaLieuInclusionRepository().creer(
      donneesCreation({
        adresseEnrichie: null,
        adresseSirene: {
          codeInsee: '75199',
          codePostal: '75099',
          commune: COMMUNE_TEST,
          nomVoie: 'Rue Sirene 1495',
          numeroVoie: 7,
        },
        itinerance: ['Fixe'],
        nom: 'Lieu test 1495 avec siret',
        siret: '12345678901234',
      })
    )

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: lieuId } })
    expect(lieu.siret_a_l_enrichissement).toBe('12345678901234')
    expect(lieu.itinerance).toStrictEqual(['Fixe'])
    const adresse = await prisma.adresse.findUniqueOrThrow({ where: { id: lieu.adresse_id ?? -1 } })
    expect(adresse).toMatchObject({ clef_interop: null, code_ban: null, nom_voie: 'Rue Sirene 1495', numero_voie: 7 })
  })

  it('réutilise une adresse déjà connue par sa clef BAN, sans en créer une nouvelle', async () => {
    // GIVEN
    const existante = await prisma.adresse.create({
      data: {
        clef_interop: adresseBan.banClefInterop,
        code_insee: '75199',
        code_postal: '75099',
        nom_commune: COMMUNE_TEST,
        nom_voie: 'Autre voie',
      },
    })

    // WHEN
    const lieuId = await new PrismaLieuInclusionRepository().creer(donneesCreation({}))

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: lieuId } })
    expect(lieu.adresse_id).toBe(existante.id)
    await expect(prisma.adresse.count({ where: { nom_commune: COMMUNE_TEST } })).resolves.toBe(1)
  })

  it('réutilise, sans la modifier, une adresse connue par ses composants mais sans clef BAN (ligne carto)', async () => {
    // GIVEN une adresse aux mêmes composants, sans clef_interop : la clé naturelle adresse_ukey interdit un doublon
    const existante = await prisma.adresse.create({
      data: {
        code_insee: '75199',
        code_postal: '75099',
        nom_commune: COMMUNE_TEST,
        nom_voie: adresseBan.banNomVoie,
        numero_voie: adresseBan.banNumeroVoie,
        repetition: adresseBan.banRepetition,
      },
    })

    // WHEN
    const lieuId = await new PrismaLieuInclusionRepository().creer(donneesCreation({}))

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: lieuId } })
    expect(lieu.adresse_id).toBe(existante.id)
    const inchangee = await prisma.adresse.findUniqueOrThrow({ where: { id: existante.id } })
    expect(inchangee.clef_interop).toBeNull()
    await expect(prisma.adresse.count({ where: { nom_commune: COMMUNE_TEST } })).resolves.toBe(1)
  })

  it('distingue « 3 rue X » de « 3B rue X » : deux adresses', async () => {
    // GIVEN
    await new PrismaLieuInclusionRepository().creer(
      donneesCreation({
        adresseEnrichie: {
          ...adresseBan,
          banClefInterop: '75199_0001_00003',
          banCodeBan: randomUUID(),
          banRepetition: null,
        },
      })
    )

    // WHEN
    await new PrismaLieuInclusionRepository().creer(donneesCreation({ nom: 'Lieu test 1495 bis' }))

    // THEN
    await expect(prisma.adresse.count({ where: { nom_commune: COMMUNE_TEST } })).resolves.toBe(2)
  })

  it('journalise la création du lieu et de son adresse (source.min__evenements)', async () => {
    // GIVEN un acteur connu : sans acteur résolu, la journalisation n'écrit rien
    await creerUnUtilisateur({ ssoEmail: 'acteur.1495@example.com', ssoId: SSO_ACTEUR })
    const runId = `test-1495-${randomUUID()}`

    // WHEN
    const lieuId = await contexteJournalisationMin.run(
      {
        actorId: undefined,
        bufferTransaction: null,
        clientTransaction: null,
        async resoudreSub() {
          return Promise.resolve(SSO_ACTEUR)
        },
        runId,
      },
      async () => new PrismaLieuInclusionRepository().creer(donneesCreation({}))
    )

    // THEN
    const evenements = await prisma.$queryRaw<Array<{ action: string; entity_id: string; source_key: string }>>`
      SELECT source_key, donnee->>'action' AS action, donnee->>'entity_id' AS entity_id
      FROM source.min__evenements WHERE run_id = ${runId} ORDER BY id`
    expect(evenements.map((evenement) => [evenement.source_key, evenement.action])).toStrictEqual([
      ['main.adresse', 'create'],
      ['main.lieu_inclusion', 'create'],
    ])
    expect(evenements[1].entity_id).toBe(String(lieuId))
  })
})

const COMMUNE_TEST = 'Testville 1495'
const SSO_ACTEUR = 'test-1495-sso'

const adresseBan = {
  banClefInterop: '75199_0001_00003_b',
  banCodeBan: '00000000-0000-4000-8000-000000001495',
  banCodeInsee: '75199',
  banCodePostal: '75099',
  banLatitude: 48.868,
  banLongitude: 2.331,
  banNomCommune: COMMUNE_TEST,
  banNomVoie: 'Rue Test 1495',
  banNumeroVoie: 3,
  banRepetition: 'B',
}

function donneesCreation(override: Partial<CreerLieuInclusionData>): CreerLieuInclusionData {
  return {
    adresseEnrichie: { ...adresseBan, banCodeBan: randomUUID() },
    adresseSirene: null,
    complementAdresse: 'Bât. B',
    date: epochTime,
    itinerance: ['Itinérant'],
    nom: 'Lieu test 1495 sans siret',
    siret: null,
    typologies: ['BIB'],
    visiblePourCartographie: false,
    ...override,
  }
}

// Le registre fait foi (#2105) : MIN modifie les lieux gérés dans la Coop au registre seul. Il signe ses
// écritures (updated_at_min, edited_by, source) et ne touche jamais ce qui appartient à la Coop :
// updated_at_coop, qui dit quand la Coop a écrit, et structure_coop_id, clé de jointure vers la Coop.
describe('repository Prisma des lieux d’inclusion — lieu géré dans la Coop (#2105)', () => {
  const LIEU_COOP_ID = 991883
  const STRUCTURE_COOP_ID = '00000000-0000-4000-8000-000000002105'
  const UPDATED_AT_COOP = new Date('2026-10-01T08:00:00.000Z')
  const COMMUNE_COOP = 'Commune test 2105'
  const structureUid = new StructureUid(LIEU_COOP_ID)

  beforeEach(async () => {
    await prisma.main_lieu_inclusion.create({
      data: {
        edited_by: 'coop',
        id: LIEU_COOP_ID,
        nom: 'Lieu test coop 2105',
        source: 'Coop numérique',
        structure_coop_id: STRUCTURE_COOP_ID,
        updated_at_coop: UPDATED_AT_COOP,
        visible_pour_cartographie_nationale: true,
      },
    })
  })

  afterEach(async () => {
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: LIEU_COOP_ID } })
    await prisma.adresse.deleteMany({ where: { nom_commune: COMMUNE_COOP } })
  })

  it.each([
    {
      ecrire: async (): Promise<void> =>
        new PrismaLieuInclusionRepository().updateInformationsGenerales({
          adresseEnrichie: null,
          adresseSirene: {
            codeInsee: '75199',
            codePostal: '75099',
            commune: COMMUNE_COOP,
            nomVoie: 'Rue Coop 2105',
            numeroVoie: 3,
          },
          complementAdresse: null,
          date: epochTime,
          nom: 'Nom corrigé par MIN',
          siret: null,
          structureUid,
        }),
      intention: 'les informations générales, adresse comprise',
    },
    {
      ecrire: async (): Promise<void> =>
        new PrismaLieuInclusionRepository().updateDescription({
          date: epochTime,
          horaires: 'Mo-Fr 09:00-12:00',
          presentationResume: 'Corrigé par MIN',
          structureUid,
        }),
      intention: 'la description',
    },
    {
      ecrire: async (): Promise<void> =>
        new PrismaLieuInclusionRepository().updateServicesModalite({
          date: epochTime,
          fraisACharge: ['Gratuit'],
          modalitesAcces: ['Se présenter'],
          structureUid,
          telephone: '+33102030405',
        }),
      intention: 'les modalités d’accès et le contact',
    },
    {
      ecrire: async (): Promise<void> =>
        new PrismaLieuInclusionRepository().updateServicesTypeAccompagnement({
          date: epochTime,
          modalites: [],
          structureUid,
          thematiques: ['Aide aux démarches administratives'],
          typesAccompagnement: ['Accompagnement individuel'],
        }),
      intention: 'les services et types d’accompagnement',
    },
    {
      ecrire: async (): Promise<void> =>
        new PrismaLieuInclusionRepository().updateServicesTypePublic({
          date: epochTime,
          priseEnChargeSpecifique: ['Surdité'],
          publicsSpecifiquementAdresses: ['Seniors'],
          structureUid,
        }),
      intention: 'les publics',
    },
    {
      ecrire: async (): Promise<void> =>
        new PrismaLieuInclusionRepository().updateVisibiliteCartographie({
          date: epochTime,
          structureUid,
          visiblePourCartographie: false,
        }),
      intention: 'la visibilité cartographique',
    },
    {
      ecrire: async (): Promise<void> =>
        new PrismaLieuInclusionRepository().supprimer({ date: epochTime, structureUid }),
      intention: 'la suppression',
    },
  ])('quand MIN écrit $intention, il signe la ligne sans toucher à ce qui appartient à la Coop', async ({ ecrire }) => {
    // WHEN
    await ecrire()

    // THEN
    const lieu = await prisma.main_lieu_inclusion.findUniqueOrThrow({ where: { id: LIEU_COOP_ID } })
    expect(lieu.updated_at_coop).toStrictEqual(UPDATED_AT_COOP)
    expect(lieu.structure_coop_id).toBe(STRUCTURE_COOP_ID)
    expect(lieu.edited_by).toBe('min')
    expect(lieu.updated_at_min).toStrictEqual(epochTime)
  })
})
