import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../prisma/prismaClient'
import { PrismaStructureLoader } from '../../../gateways/PrismaStructureLoader'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const search = request.nextUrl.searchParams.get('search') ?? ''
  const structureLoader = new PrismaStructureLoader(prisma)
  const structuresReadModel = await structureLoader.findStructures(search)
  return NextResponse.json(structuresReadModel)
}
