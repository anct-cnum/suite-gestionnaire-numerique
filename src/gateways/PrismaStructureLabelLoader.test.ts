import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaStructureLabelLoader } from './PrismaStructureLabelLoader'
import { creerUnContact, creerUneStructure, creerUnUtilisateur } from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

describe('structure label loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('les informations d’identité et les contacts de la structure sont retournés', async () => {
    // GIVEN
    await prisma.$executeRaw`INSERT INTO admin.region (geom, code, nom)
      VALUES (public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326), '84', 'Auvergne-Rhône-Alpes')`
    await prisma.$executeRaw`INSERT INTO admin.departement (geom, region_id, code, nom)
      VALUES (
        public.ST_GeomFromText('MULTIPOLYGON(((0 0,0 1,1 1,0 0)))', 4326),
        (SELECT id FROM admin.region WHERE code = '84'),
        '69',
        'Rhône'
      )`
    await prisma.categories_juridiques.create({
      data: { code: '7343', niveau: 3, nom: 'Communauté urbaine' },
    })
    await creerUneStructure({
      adresse: '201 bis rue de la plaine',
      categorie_juridique: '7343',
      codePostal: '69000',
      commune: 'Lyon',
      departementCode: '69',
      id: 4901,
      identifiantEtablissement: '79227291600034',
      nom: 'La Voie Du Num',
    })
    const contactId = await creerUnContact({
      email: 'didier.durand@example.com',
      est_referent_fne: true,
      fonction: 'Directeur',
      nom: 'Durand',
      prenom: 'Didier',
      telephone: '0550594314',
    })
    await prisma.contact_structure_administrative.create({
      data: { contact_id: contactId, structure_administrative_id: 4901 },
    })

    // WHEN
    const readModel = await new PrismaStructureLabelLoader().get(4901)

    // THEN
    expect(readModel).toStrictEqual({
      contacts: [
        {
          email: 'didier.durand@example.com',
          estReferentFNE: true,
          fonction: 'Directeur',
          id: contactId,
          nom: 'Durand',
          prenom: 'Didier',
          telephone: '0550594314',
        },
      ],
      derniereAttestation: null,
      identite: {
        adresse: '201 bis rue de la plaine - Dept 69, 69000 Lyon',
        departement: 'Rhône',
        nom: 'La Voie Du Num',
        region: 'Auvergne-Rhône-Alpes',
        siret: '79227291600034',
        typologie: 'Communauté urbaine',
      },
      structureId: 4901,
    })
  })

  it('sans adresse ni contact ni catégorie juridique, les champs sont vides', async () => {
    // GIVEN
    await creerUneStructure({ id: 4902, identifiantEtablissement: '79227291600042', nom: 'Sans Adresse' })

    // WHEN
    const readModel = await new PrismaStructureLabelLoader().get(4902)

    // THEN
    expect(readModel).toStrictEqual({
      contacts: [],
      derniereAttestation: null,
      identite: {
        adresse: '',
        departement: '',
        nom: 'Sans Adresse',
        region: '',
        siret: '79227291600042',
        typologie: '',
      },
      structureId: 4902,
    })
  })

  it('la date de la dernière attestation est retournée quand la structure est labellisée', async () => {
    // GIVEN
    await creerUneStructure({ id: 4903, identifiantEtablissement: '79227291600059', nom: 'Labellisée' })
    await creerUnUtilisateur({ id: 7 })
    await prisma.main_conum_labellisation.create({
      data: { date_attestation: epochTime, structure_id: 4903, utilisateur_id: 7 },
    })
    await prisma.main_conum_labellisation.create({
      data: { date_attestation: epochTimePlusOneDay, structure_id: 4903, utilisateur_id: 7 },
    })

    // WHEN
    const readModel = await new PrismaStructureLabelLoader().get(4903)

    // THEN
    expect(readModel.derniereAttestation).toStrictEqual(epochTimePlusOneDay)
  })
})
