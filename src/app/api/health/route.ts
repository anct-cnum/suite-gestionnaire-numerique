import { NextResponse } from 'next/server'

import prisma from '../../../../prisma/prismaClient'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse<Readonly<{ status: 'error' | 'ok' }>>> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok' }, { headers: { 'cache-control': 'no-store' } })
  } catch {
    return NextResponse.json({ status: 'error' }, { headers: { 'cache-control': 'no-store' }, status: 503 })
  }
}
