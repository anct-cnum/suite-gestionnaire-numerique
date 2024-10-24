/* eslint-disable no-console */

import { Prisma } from '@prisma/client'

import prisma from '../prisma/prismaClient'
import groupements from '../ressources/groupements.json'

async function migration() {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des groupements commence')

  const groupementsRecord = [
    ...groupements,
    unGroupementDeTest,
  ]
  console.log(greenColor, `${groupementsRecord.length} groupements CoNum sont récupérés`)

  await migrateGroupements(groupementsRecord)

  console.log(greenColor, 'La migration des groupements est finie')
}

void migration()

const unGroupementDeTest: Prisma.GroupementRecordUncheckedCreateInput = {
  id: 10_000_000,
  nom: 'SGN Corporation',
}

async function migrateGroupements(groupementsRecord: Array<Prisma.GroupementRecordUncheckedCreateInput>) {
  await prisma.groupementRecord.createMany({
    data: groupementsRecord,
  })
}
