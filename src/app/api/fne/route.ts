import { NextResponse } from 'next/server'

import { PrismaIndicesDeFragiliteLoader } from '@/gateways/PrismaIndicesDeFragiliteLoader'
import { RecupererMesIndicesDeFragilite } from '@/use-cases/queries/RecupererMesIndicesDeFragilite'

export async function GET(): Promise<NextResponse> {
  try {
    const loader = new PrismaIndicesDeFragiliteLoader()
    const useCase = new RecupererMesIndicesDeFragilite(loader)

    const result = await useCase.handle({ codeDepartement: '01' })

    return NextResponse.json(result)
  // eslint-disable-next-line sonarjs/no-ignored-exceptions, @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des indices de fragilité' },
      { status: 500 }
    )
  }
}
