/* eslint-disable no-console */

import { Prisma } from '@prisma/client'

import { coNumClient } from './co-num/coNumClient'
import prisma from '../prisma/prismaClient'

async function migration() {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des structures commence')

  const structuresCoNumRecord = await retrieveStructuresCoNum()
  console.log(greenColor, `${structuresCoNumRecord.length} structures CoNum sont récupérés`)

  const structuresRecord = [
    ...transformStructuresCoNumToStructures(structuresCoNumRecord),
    uneStructureDeTest(),
  ]
  console.log(greenColor, `${structuresRecord.length} structures CoNum et FNE sont transformés en structures`)

  await migrateStructures(structuresRecord)

  console.log(greenColor, 'La migration des structures est finie')
}

void migration()

async function retrieveStructuresCoNum(): Promise<Array<StructureCoNumRecord>> {
  const { db, client } = await coNumClient()

  try {
    return await db.collection('structures')
      .aggregate<StructureCoNumRecord>([
        {
          $project: {
            _id: 1,
            codeDepartement: 1,
            codeRegion: 1,
            contact: 1,
            insee: 1,
            nom: 1,
            reseau: 1,
            ridet: 1,
            siret: 1,
            statut: 1,
            type: 1,
          },
        },
        {
          $match: {
            // il y a 126 structures avec statut REFUS_COSELEC qui n'ont pas de SIRET donc on ne les prend pas
            siret: { $ne: null },
            statut: {
              // On ne prend pas les autres statuts car on ne veut pas garder d'historique
              $in: ['ABANDON', 'CREEE', 'REFUS_COORDINATEUR', 'REFUS_COSELEC', 'VALIDATION_COSELEC'],
            },
          },
        },
      ])
      .toArray()
  } catch (error) {
    console.error((error as Error).message)
  } finally {
    await client.close()
  }

  return []
}

function transformStructuresCoNumToStructures(
  structuresCoNumRecord: Array<StructureCoNumRecord>
): Array<Prisma.StructureRecordUncheckedCreateInput> {
  return structuresCoNumRecord.map((structureCoNumRecord): Prisma.StructureRecordUncheckedCreateInput => {
    return {
      // Le champ insee est rempli à partir du moment où la structure est validée par le COSELEC
      // @ts-expect-error
      adresse: structureCoNumRecord.insee?.adresse ?? {},
      contact: structureCoNumRecord.contact,
      // On ne peut pas changer directement le 00 en 978 en production car beaucoup de logique est basée dessus
      departementCode: structureCoNumRecord.codeDepartement === '00' ? '978' : structureCoNumRecord.codeDepartement,
      idMongo: structureCoNumRecord._id,
      identifiantEtablissement: structureCoNumRecord.siret || structureCoNumRecord.ridet,
      nom: structureCoNumRecord.nom,
      regionCode: structureCoNumRecord.codeRegion,
      statut: structureCoNumRecord.statut,
      type: structureCoNumRecord.type,
    }
  })
}

function uneStructureDeTest(): Prisma.StructureRecordUncheckedCreateInput {
  return {
    adresse: {
      code_postal: '84200',
      indice_repetition_voie: 'BIS',
      libelle_commune: 'PARIS',
      libelle_voie: 'CHARLES DE GAULLE',
      numero_voie: '3',
      type_voie: 'AVENUE',
    },
    contact: {
      email: 'contact@example.com',
      fonction: 'Président',
      nom: 'Dupont',
      prenom: 'Tartempion',
      telephone: '0102030405',
    },
    departementCode: 'zzz',
    id: 10_000_000,
    idMongo: 'zzz',
    identifiantEtablissement: 'toto',
    nom: 'SGN structure',
    regionCode: 'zz',
    statut: 'VALIDATION_COSELEC',
    type: 'COMMUNE',
  }
}

async function migrateStructures(structuresRecord: Array<Prisma.StructureRecordUncheckedCreateInput>) {
  await prisma.structureRecord.createMany({
    data: structuresRecord,
  })
}

type StructureCoNumRecord = Readonly<{
  _id: string
  codeDepartement: string
  codeRegion: string
  contact: {
    email: string
    fonction: string
    nom: string
    prenom: string
    telephone: string
  }
  insee?: Readonly<{
    adresse: PrismaJson.Adresse
  }>
  nom: string
  reseau: string
  ridet: string
  siret: string
  statut: string
  type: string
}>
