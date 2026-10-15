import { afterEach, describe, expect, it } from 'vitest'

import { PrismaRecupererLieuDetailsLoader } from './PrismaRecupererLieuDetailsLoader'
import prisma from '../../prisma/prismaClient'
import { LieuDetailsReadModel } from '@/use-cases/queries/RecupererLieuDetails'

const LIEU_ID = 991881
const CLEF_INTEROP = 'test_2092_region_du_lieu'

describe('détails d’un lieu d’inclusion (loader Prisma)', () => {
  afterEach(async () => {
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: LIEU_ID } })
    await prisma.adresse.deleteMany({ where: { clef_interop: CLEF_INTEROP } })
  })

  it('désérialise les colonnes array d’enums Postgres en vrais tableaux (#1881)', async () => {
    // GIVEN
    // $queryRaw renvoie les arrays d'enums custom en string littérale '{...}' sans cast ::text[] :
    // chaque champ enum-array est renseigné pour garantir que la fiche ne retombe pas en 404.
    await prisma.main_lieu_inclusion.create({
      data: {
        dispositif_programmes_nationaux: ['ConseillersNumeriques'],
        frais_a_charge: ['Gratuit'],
        id: LIEU_ID,
        itinerance: ['Fixe'],
        modalites_acces: ['SePresenter', 'Telephoner'],
        modalites_accompagnement: ['EnAutonomie', 'AccompagnementIndividuel'],
        nom: 'Lieu test enum arrays',
      },
    })

    // WHEN
    const readModel = await new PrismaRecupererLieuDetailsLoader().recuperer(String(LIEU_ID))

    // THEN
    expect(readModel).not.toHaveProperty('type')
    const details = readModel as LieuDetailsReadModel
    expect(details.lieuAccueilPublic.modalitesAccueil).toBe('En autonomie, Accompagnement individuel')
    expect(details.lieuAccueilPublic.modalitesAcces).toStrictEqual(['Se présenter', 'Téléphoner'])
    expect(details.lieuAccueilPublic.fraisACharge).toStrictEqual(['Gratuit'])
    expect(details.lieuAccueilPublic.itinerance).toStrictEqual(['Fixe'])
    expect(details.lieuAccueilPublic.conseillerNumeriqueLabellePhase2).toBe(true)
  })

  it.each([
    {
      estLieuCoop: true,
      intention: 'géré dans la Coop quand structure_coop_id est renseigné',
      structureCoopId: '00000000-0000-4000-8000-000000000001',
    },
    {
      estLieuCoop: false,
      intention: 'géré hors Coop quand structure_coop_id est vide',
      structureCoopId: null,
    },
  ])('indique que le lieu est $intention (#1951)', async ({ estLieuCoop, structureCoopId }) => {
    // GIVEN
    await prisma.main_lieu_inclusion.create({
      data: {
        id: LIEU_ID,
        nom: 'Lieu test coop',
        structure_coop_id: structureCoopId,
      },
    })

    // WHEN
    const readModel = await new PrismaRecupererLieuDetailsLoader().recuperer(String(LIEU_ID))

    // THEN
    expect(readModel).not.toHaveProperty('type')
    expect((readModel as LieuDetailsReadModel).estLieuCoop).toBe(estLieuCoop)
  })

  it('lit le courriel du lieu sous la clé email, celle de la Coop et d’api.carto (#2106)', async () => {
    // GIVEN
    await prisma.main_lieu_inclusion.create({
      data: { contact: { courriels: { email: 'lieu@exemple.fr' } }, id: LIEU_ID, nom: 'Lieu test courriel' },
    })

    // WHEN
    const readModel = await new PrismaRecupererLieuDetailsLoader().recuperer(String(LIEU_ID))

    // THEN
    expect((readModel as LieuDetailsReadModel).lieuAccueilPublic.email).toBe('lieu@exemple.fr')
  })

  it('ne lit plus l’ancienne clé contact_public, dont le stock est repris (#2106)', async () => {
    // GIVEN
    await prisma.main_lieu_inclusion.create({
      data: { contact: { courriels: { contact_public: 'ancien@exemple.fr' } }, id: LIEU_ID, nom: 'Lieu test courriel' },
    })

    // WHEN
    const readModel = await new PrismaRecupererLieuDetailsLoader().recuperer(String(LIEU_ID))

    // THEN
    expect((readModel as LieuDetailsReadModel).lieuAccueilPublic.email).toBeUndefined()
  })

  it('expose le référencement carto et le drapeau de visibilité pour signaler un lieu en attente (#1495)', async () => {
    // GIVEN
    await prisma.main_lieu_inclusion.create({
      data: {
        id: LIEU_ID,
        nom: 'Lieu test référencement',
        structure_cartographie_nationale_id: null,
        visible_pour_cartographie_nationale: true,
      },
    })

    // WHEN
    const readModel = await new PrismaRecupererLieuDetailsLoader().recuperer(String(LIEU_ID))

    // THEN
    expect(readModel).not.toHaveProperty('type')
    expect((readModel as LieuDetailsReadModel).estReferenceSurLaCarte).toBe(false)
    expect((readModel as LieuDetailsReadModel).visiblePourCartographie).toBe(true)
  })

  it.each([
    { codeInsee: '05061', codeRegion: '93', intention: 'd’un département métropolitain' },
    { codeInsee: '2A004', codeRegion: '94', intention: 'de Corse' },
    { codeInsee: '97209', codeRegion: '02', intention: 'd’outre-mer' },
  ])(
    'déduit la région d’un lieu $intention du département de son adresse (#2092)',
    async ({ codeInsee, codeRegion }) => {
      // GIVEN
      const adresse = await prisma.adresse.create({
        data: {
          clef_interop: CLEF_INTEROP,
          code_insee: codeInsee,
          code_postal: '00000',
          nom_commune: 'Commune',
          nom_voie: 'Rue',
        },
      })
      await prisma.main_lieu_inclusion.create({
        data: { adresse_id: adresse.id, id: LIEU_ID, nom: 'Lieu test région' },
      })

      // WHEN
      const readModel = await new PrismaRecupererLieuDetailsLoader().recuperer(String(LIEU_ID))

      // THEN
      expect((readModel as LieuDetailsReadModel).codeRegion).toBe(codeRegion)
    }
  )
})
