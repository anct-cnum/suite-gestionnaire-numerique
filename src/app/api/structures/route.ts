import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../prisma/prismaClient'
import { getSession } from '../../../gateways/NextAuthAuthentificationGateway'
import { PrismaStructureLoader } from '../../../gateways/PrismaStructureLoader'
import { isNullish, isNullishOrEmpty } from '../../../shared/lang'

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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const structuresReadModel = await structureLoader.findStructures(search!)
  return NextResponse.json(structuresReadModel)
}
