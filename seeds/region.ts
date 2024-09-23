/* eslint-disable no-console */

import { Prisma } from '@prisma/client'

import regions from './data/regions.json'
import prisma from '../prisma/prismaClient'

async function migration() {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des régions commence')

  console.log(greenColor, `${regions.length} régions CoNum sont récupérés`)

  await migrateRegions(regions)

  console.log(greenColor, 'La migration des régions est finie')
}

void migration()

async function migrateRegions(regionsRecord: Array<Prisma.RegionRecordUncheckedCreateInput>) {
  await prisma.regionRecord.createMany({
    data: regionsRecord,
  })
}
