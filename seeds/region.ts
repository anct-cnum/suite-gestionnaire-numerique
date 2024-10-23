/* eslint-disable no-console */

import { Prisma } from '@prisma/client'

import prisma from '../prisma/prismaClient'
import regions from '../ressources/regions.json'

async function migration() {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des régions commence')

  console.log(greenColor, `${regions.length} régions CoNum sont récupérés`)

  const regionsRecord = [
    ...regions,
    uneRegionDeTest,
  ]

  await migrateRegions(regionsRecord)

  console.log(greenColor, 'La migration des régions est finie')
}

void migration()

const uneRegionDeTest: Prisma.RegionRecordUncheckedCreateInput = {
  code: 'zz',
  nom: 'SGN région',
}

async function migrateRegions(regionsRecord: Array<Prisma.RegionRecordUncheckedCreateInput>) {
  await prisma.regionRecord.createMany({
    data: regionsRecord,
  })
}
