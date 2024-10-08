/* eslint-disable no-console */

import { Prisma } from '@prisma/client'

import groupements from './data/groupements.json'
import prisma from '../prisma/prismaClient'

async function migration() {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des groupements commence')

  const groupementsRecord = [
    ...groupements,
    ajouterUnGroupementDeTest(),
  ]
  console.log(greenColor, `${groupementsRecord.length} groupements CoNum sont récupérés`)

  await migrateGroupements(groupementsRecord)

  console.log(greenColor, 'La migration des groupements est finie')
}

void migration()

function ajouterUnGroupementDeTest(): Prisma.GroupementRecordUncheckedCreateInput {
  return {
    id: 10_000_000,
    nom: 'SGN Corporation',
  }
}

async function migrateGroupements(groupementsRecord: Array<Prisma.GroupementRecordUncheckedCreateInput>) {
  await prisma.groupementRecord.createMany({
    data: groupementsRecord,
  })
}
