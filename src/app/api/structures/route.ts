import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../prisma/prismaClient'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaStructureLoader } from '@/gateways/PrismaStructureLoader'
import { isNullishOrEmpty, isNullish } from '@/shared/lang'
import { RechercherLesStructures, StructuresReadModel } from '@/use-cases/queries/RechercherLesStructures'

export async function GET(request: NextRequest): Promise<NextResponse<StructuresReadModel | null>> {
  const session = await getSession()
  if (isNullish(session)) {
    return NextResponse.json(null, { status: 403 })
  }
  const search = request.nextUrl.searchParams.get('search')
  if (isNullishOrEmpty(search)) {
    return NextResponse.json(null, { status: 400 })
  }
  const rechercherLesStructures = new RechercherLesStructures(new PrismaStructureLoader(prisma.structureRecord))
  const structuresReadModel = await rechercherLesStructures.handle({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    match: search!,
    zone: makeZone(request.nextUrl.searchParams),
  })
  return NextResponse.json(structuresReadModel)
}

function makeZone(searchParams: URLSearchParams): Parameters<typeof RechercherLesStructures.prototype.handle>[0]['zone'] {
  const [departement, region] = [searchParams.get('departement'), searchParams.get('region')]
  let zone: ReturnType<typeof makeZone>
  if (!isNullishOrEmpty(departement)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    zone = { code: departement!, type: 'departement' }
  } else if (!isNullishOrEmpty(region)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    zone = { code: region!, type: 'region' }
  }
  return zone
}
