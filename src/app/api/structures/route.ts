import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../prisma/prismaClient'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaStructureLoader } from '@/gateways/PrismaStructureLoader'
import { isNullishOrEmpty, isNullish } from '@/shared/lang'
import { RechercherStruturesQuery } from '@/use-cases/queries/RechercherLesStructures'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getSession()
  if (isNullish(session)) {
    return NextResponse.json(null, { status: 403 })
  }
  const search = request.nextUrl.searchParams.get('search')
  if (isNullishOrEmpty(search)) {
    return NextResponse.json(null, { status: 400 })
  }
  const structureLoader = new PrismaStructureLoader(prisma)
  const structuresReadModel = await structureLoader.findStructures({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    match: search!,
    ...makeZone(request.nextUrl.searchParams),
  })
  return NextResponse.json(structuresReadModel)
}

function makeZone(searchParams: URLSearchParams): {zone?: RechercherStruturesQuery['zone']} {
  const [departement, region] = [searchParams.get('departement'), searchParams.get('region')]
  let zone: RechercherStruturesQuery['zone'] | undefined
  if (!isNullishOrEmpty(departement)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    zone = ['departement', departement!]
  } else if (!isNullishOrEmpty(region)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    zone = ['region', region!]
  }
  return { zone }
}
