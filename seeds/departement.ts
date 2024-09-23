/* eslint-disable no-console */

import { Prisma } from '@prisma/client'

import departements from './data/departements.json'
import prisma from '../prisma/prismaClient'

async function migration() {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des departements commence')

  console.log(greenColor, `${departements.length} departements CoNum sont récupérés`)

  await migrateDepartements(departements)

  console.log(greenColor, 'La migration des departements est finie')
}

void migration()

async function migrateDepartements(departementsRecord: Array<Prisma.DepartementRecordUncheckedCreateInput>) {
  await prisma.departementRecord.createMany({
    data: departementsRecord,
  })
}
