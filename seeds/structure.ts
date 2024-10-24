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
    uneStructureDeTest,
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
            nom: 1,
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
      idMongo: structureCoNumRecord._id,
      nom: structureCoNumRecord.nom,
    }
  })
}

const uneStructureDeTest: Prisma.StructureRecordUncheckedCreateInput = {
  id: 10_000_000,
  idMongo: 'zzz',
  nom: 'SGN structure',
}

async function migrateStructures(structuresRecord: Array<Prisma.StructureRecordUncheckedCreateInput>) {
  await prisma.structureRecord.createMany({
    data: structuresRecord,
  })
}

type StructureCoNumRecord = Readonly<{
  _id: string
  nom: string
}>
