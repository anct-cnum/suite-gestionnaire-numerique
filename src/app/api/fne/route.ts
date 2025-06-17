import { NextResponse } from 'next/server'

import prisma from '../../../../prisma/prismaClient'
import { PrismaIndicesDeFragiliteLoader } from '@/infrastructure/loaders/PrismaIndicesDeFragiliteLoader'
import { RecupererMesIndicesDeFragilite } from '@/use-cases/queries/RecupererMesIndicesDeFragilite'

export async function GET() {
  try {
    const loader = new PrismaIndicesDeFragiliteLoader(prisma)
    const useCase = new RecupererMesIndicesDeFragilite(loader)

    const result = await useCase.handle({ codeDepartement: '29' })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur lors de la récupération des indices de fragilité:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des indices de fragilité' },
      { status: 500 }
    )
  }
}
