import { NextRequest, NextResponse } from 'next/server'

import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import {
  AccompagnementsRealisesResult,
  fetchAccompagnementsRealises,
} from '@/use-cases/queries/fetchAccompagnementsRealises'

export async function GET(
  request: NextRequest
): Promise<NextResponse<AccompagnementsRealisesResult | ErrorViewModel | null>> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(null, { status: 403 })
  }

  const territoire = request.nextUrl.searchParams.get('territoire') ?? 'France'
  const resultat = await fetchAccompagnementsRealises(territoire)

  return NextResponse.json(resultat)
}
