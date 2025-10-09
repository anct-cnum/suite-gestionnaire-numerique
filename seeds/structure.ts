/* eslint-disable no-console */

import { Prisma } from '@prisma/client'

import { coNumClient } from './co-num/coNumClient'
import prisma from '../prisma/prismaClient'

async function migration(): Promise<void> {
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
  const { client, db } = await coNumClient()

  try {
    return await db.collection('structures')
      .aggregate<StructureCoNumRecord>([
        {
          $project: {
            _id: 1,
            codeDepartement: 1,
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
    const adresse = []
    if (structureCoNumRecord.insee) {
      if (structureCoNumRecord.insee.adresse.numero_voie) {
        adresse.push(structureCoNumRecord.insee.adresse.numero_voie)
      }
      if (structureCoNumRecord.insee.adresse.indice_repetition_voie) {
        adresse.push(structureCoNumRecord.insee.adresse.indice_repetition_voie)
      }
      if (structureCoNumRecord.insee.adresse.type_voie) {
        adresse.push(structureCoNumRecord.insee.adresse.type_voie)
      }
      if (structureCoNumRecord.insee.adresse.libelle_voie) {
        adresse.push(structureCoNumRecord.insee.adresse.libelle_voie)
      }
    }

    return {
      // Le champ insee est rempli à partir du moment où la structure est validée par le COSELEC
      adresse: adresse.join(' '),
      codePostal: structureCoNumRecord.insee?.adresse.code_postal ?? '',
      commune: structureCoNumRecord.insee?.adresse.libelle_commune ?? '',
      contact: structureCoNumRecord.contact,
      // On ne peut pas changer directement le 00 en 978 en production car beaucoup de logique est basée dessus
      departementCode: structureCoNumRecord.codeDepartement === '00' ? '978' : structureCoNumRecord.codeDepartement,
      identifiantEtablissement: structureCoNumRecord.siret || structureCoNumRecord.ridet,
      // eslint-disable-next-line no-underscore-dangle
      idMongo: structureCoNumRecord._id,
      nom: structureCoNumRecord.nom,
      statut: structureCoNumRecord.statut,
      type: structureCoNumRecord.type,
    }
  })
}

function uneStructureDeTest(): Prisma.StructureRecordUncheckedCreateInput {
  return {
    adresse: '3 avenue Charles De Gaulle',
    codePostal: '75000',
    commune: 'Paris',
    contact: {
      email: 'contact@example.com',
      fonction: 'Président',
      nom: 'Dupont',
      prenom: 'Tartempion',
      telephone: '0102030405',
    },
    departementCode: 'zzz',
    id: 10_000_000,
    identifiantEtablissement: 'zzzzzzzzzzzzzz',
    idMongo: 'zzz',
    nom: 'Structure MIN',
    statut: 'VALIDATION_COSELEC',
    type: 'COMMUNE',
  }
}

async function migrateStructures(structuresRecord: Array<Prisma.StructureRecordUncheckedCreateInput>): Promise<void> {
  await prisma.structureRecord.createMany({
    data: structuresRecord,
  })
}

type StructureCoNumRecord = Readonly<{
  _id: string
  codeDepartement: string
  contact: {
    email: string
    fonction: string
    nom: string
    prenom: string
    telephone: string
  }
  insee?: Readonly<{
    adresse: Readonly<{
      code_postal: string
      indice_repetition_voie: string
      libelle_commune: string
      libelle_voie: string
      numero_voie: string
      type_voie: string
    }>
  }>
  nom: string
  reseau: string
  ridet: string
  siret: string
  statut: string
  type: string
}>
