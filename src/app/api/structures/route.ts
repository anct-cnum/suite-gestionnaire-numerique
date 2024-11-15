import { NextRequest, NextResponse } from 'next/server'

import prisma from '../../../../prisma/prismaClient'
import { PostgreStructureLoader } from '../../../gateways/PostgreStructureLoader'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const search = req.nextUrl.searchParams.get('search')
  const rechercherLesStructures = new PostgreStructureLoader(prisma)
  if (search === null) {
    return NextResponse.json([])
  }
  const structures = await rechercherLesStructures.findStructures(search)
  return NextResponse.json(structures)
}
