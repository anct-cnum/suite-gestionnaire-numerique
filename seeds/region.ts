/* eslint-disable no-console */

import { Prisma } from '@prisma/client'

import prisma from '../prisma/prismaClient'
import regions from '../ressources/regions.json'

async function migration(): Promise<void> {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des régions commence')

  console.log(greenColor, `${regions.length} régions CoNum sont récupérés`)

  const regionsRecord = [
    ...regions,
    uneRegionDeTest(),
  ]

  await migrateRegions(regionsRecord)

  console.log(greenColor, 'La migration des régions est finie')
}

void migration()

function uneRegionDeTest(): Prisma.RegionRecordUncheckedCreateInput {
  return {
    code: 'zz',
    nom: 'Région MIN',
  }
}

async function migrateRegions(regionsRecord: Array<Prisma.RegionRecordUncheckedCreateInput>): Promise<void> {
  await prisma.regionRecord.createMany({
    data: regionsRecord,
  })
}
