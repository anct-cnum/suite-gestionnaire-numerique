import { NextRequest, NextResponse } from 'next/server'

import { PrismaRechercheTerritoiresLoader } from '@/gateways/PrismaRechercheTerritoiresLoader'
import { RechercherTerritoires, TerritoiresTrouvesReadModel } from '@/use-cases/queries/RechercherTerritoires'

// Route publique : la recherche territoriale est utilisée par le site vitrine, sans session.
export async function GET(request: NextRequest): Promise<NextResponse<TerritoiresTrouvesReadModel>> {
  const terme = (request.nextUrl.searchParams.get('q') ?? '').trim()
  if (terme.length < 2) {
    return NextResponse.json({ territoires: [], total: 0 })
  }

  const readModel = await new RechercherTerritoires(new PrismaRechercheTerritoiresLoader()).handle({
    perimetre: { type: 'complet' },
    terme,
  })
  return NextResponse.json(readModel)
}
