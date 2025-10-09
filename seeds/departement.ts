/* eslint-disable no-console */

import { Prisma } from '@prisma/client'

import prisma from '../prisma/prismaClient'
import departements from '../ressources/departements.json'

async function migration(): Promise<void> {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des departements commence')

  console.log(greenColor, `${departements.length} departements CoNum sont récupérés`)

  const departementsRecord = [
    ...departements,
    unDepartementDeTest(),
  ]

  await migrateDepartements(departementsRecord)

  console.log(greenColor, 'La migration des departements est finie')
}

void migration()

function unDepartementDeTest(): Prisma.DepartementRecordUncheckedCreateInput {
  return {
    code: 'zzz',
    nom: 'Département MIN',
    regionCode: 'zz',
  }
}

async function migrateDepartements(
  departementsRecord: Array<Prisma.DepartementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.departementRecord.createMany({
    data: departementsRecord,
  })
}
